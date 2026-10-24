import json
import sqlite3
import os
import shutil
import sys
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_DB = os.path.join(BASE_DIR, "database", "database.sqlite")
UMS_DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "all_ums_it_students.json")

# Explicit known ID corrections from UMS
KNOWN_ID_CORRECTIONS = {
    "61797": "61798", # SAMRITH RATH
    "61803": "61805", # VORN SAVORN
}

def sync_database(target_db_path=DEFAULT_DB):
    if not os.path.exists(target_db_path):
        print(f"ERROR: Target database not found at {target_db_path}")
        return False

    if not os.path.exists(UMS_DATA_FILE):
        print(f"ERROR: UMS data file not found at {UMS_DATA_FILE}")
        return False

    with open(UMS_DATA_FILE, "r", encoding="utf-8") as f:
        ums_data = json.load(f)
    ums_students = ums_data.get("students", [])

    print(f"Loaded {len(ums_students)} students from UMS authoritative data.")

    # 1. Create a safe backup before any modifications
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{target_db_path}.bak.{timestamp}"
    shutil.copy2(target_db_path, backup_path)
    print(f"Created safety backup at: {backup_path}")

    conn = sqlite3.connect(target_db_path)
    cursor = conn.cursor()

    # Load existing signatures to guarantee 0 data loss
    cursor.execute("""
        SELECT student_id, student_id_formatted, name_latin, signed, signed_at, signature_notes, signed_device_ip 
        FROM thesis_students 
        WHERE signed = 1
    """)
    signed_records = cursor.fetchall()
    print(f"Found {len(signed_records)} already-signed students in target DB. Preserving signatures...")

    # Map signed info by student_id and by normalized name
    signed_map_by_id = {}
    signed_map_by_name = {}
    for r in signed_records:
        sid_norm = str(int(r[0])) if str(r[0]).isdigit() else str(r[0])
        signed_map_by_id[sid_norm] = r
        clean_name = " ".join(r[2].strip().upper().split())
        signed_map_by_name[clean_name] = r

    # Also handle known ID corrections so signed status carries over
    for old_id, new_id in KNOWN_ID_CORRECTIONS.items():
        if old_id in signed_map_by_id and new_id not in signed_map_by_id:
            signed_map_by_id[new_id] = signed_map_by_id[old_id]

    stats = {
        "updated": 0,
        "inserted": 0,
        "class_fixed": 0,
        "id_fixed": 0,
        "signed_preserved": 0
    }

    for u in ums_students:
        uid = u["student_id"]
        fmt_id = u["student_id_formatted"]
        uname_clean = " ".join(u["name_latin"].strip().upper().split())

        # Check if student exists in DB by ID or by known correction or name
        cursor.execute("SELECT id, student_id, class_code, signed, signed_at, signature_notes, signed_device_ip FROM thesis_students WHERE student_id = ? OR student_id_formatted = ?", (uid, fmt_id))
        existing = cursor.fetchone()

        if not existing:
            # Check if this student had a typo ID in the old DB
            for old_id, correct_id in KNOWN_ID_CORRECTIONS.items():
                if correct_id == uid:
                    cursor.execute("SELECT id, student_id, class_code, signed, signed_at, signature_notes, signed_device_ip FROM thesis_students WHERE student_id = ?", (old_id,))
                    existing = cursor.fetchone()
                    if existing:
                        stats["id_fixed"] += 1
                        print(f"   [ID Correction] Updating student record {existing[0]}: {old_id} -> {uid} ({u['name_latin']})")
                    break

        if not existing:
            # Check by exact name match
            cursor.execute("SELECT id, student_id, class_code, signed, signed_at, signature_notes, signed_device_ip FROM thesis_students WHERE UPPER(name_latin) = ?", (u["name_latin"].strip().upper(),))
            existing = cursor.fetchone()
            if existing and existing[1] != uid:
                stats["id_fixed"] += 1
                print(f"   [ID Correction by name] Updating student record {existing[0]}: {existing[1]} -> {uid} ({u['name_latin']})")

        # Determine signed status to preserve
        is_signed = 0
        signed_at = None
        sig_notes = None
        sig_ip = None

        if existing and existing[3]: # signed == 1
            is_signed = existing[3]
            signed_at = existing[4]
            sig_notes = existing[5]
            sig_ip = existing[6]
            stats["signed_preserved"] += 1
        elif uid in signed_map_by_id:
            s_row = signed_map_by_id[uid]
            is_signed = s_row[3]
            signed_at = s_row[4]
            sig_notes = s_row[5]
            sig_ip = s_row[6]
            stats["signed_preserved"] += 1
        elif uname_clean in signed_map_by_name:
            s_row = signed_map_by_name[uname_clean]
            is_signed = s_row[3]
            signed_at = s_row[4]
            sig_notes = s_row[5]
            sig_ip = s_row[6]
            stats["signed_preserved"] += 1

        if existing:
            rec_id = existing[0]
            old_class = existing[2]
            if old_class != u["class_code"]:
                stats["class_fixed"] += 1

            cursor.execute("""
                UPDATE thesis_students SET
                    student_id = ?,
                    student_id_formatted = ?,
                    name_latin = ?,
                    name_khmer = COALESCE(NULLIF(?, ''), name_khmer),
                    sex = ?,
                    phone = COALESCE(NULLIF(?, ''), phone),
                    campus_code = ?,
                    campus_name = ?,
                    major_code = ?,
                    major_name = ?,
                    class_code = ?,
                    shift = ?,
                    batch = ?,
                    group_no = COALESCE(?, group_no),
                    score = COALESCE(?, score),
                    result_status = CASE WHEN result_status IN ('PASS', 'REPEAT') THEN result_status ELSE ? END,
                    signed = ?,
                    signed_at = ?,
                    signature_notes = ?,
                    signed_device_ip = ?,
                    updated_at = datetime('now')
                WHERE id = ?
            """, (
                uid,
                fmt_id,
                u["name_latin"],
                u["name_khmer"],
                u["sex"],
                u["phone"],
                u["campus_code"],
                u["campus_name"],
                u["major_code"],
                u["major_name"],
                u["class_code"],
                u["shift"],
                u["batch"],
                u["group_no"],
                u["score"],
                u["result_status"],
                is_signed,
                signed_at,
                sig_notes,
                sig_ip,
                rec_id
            ))
            stats["updated"] += 1
        else:
            # Insert new student from UMS
            cursor.execute("""
                INSERT INTO thesis_students (
                    student_id, student_id_formatted, name_latin, name_khmer, sex, phone,
                    campus_code, campus_name, major_code, major_name, class_code, shift, batch,
                    academic_year, group_no, score, result_status, signed, signed_at, signature_notes, signed_device_ip,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '2023-2024', ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            """, (
                uid,
                fmt_id,
                u["name_latin"],
                u["name_khmer"],
                u["sex"],
                u["phone"],
                u["campus_code"],
                u["campus_name"],
                u["major_code"],
                u["major_name"],
                u["class_code"],
                u["shift"],
                u["batch"],
                u["group_no"],
                u["score"],
                u["result_status"],
                is_signed,
                signed_at,
                sig_notes,
                sig_ip
            ))
            stats["inserted"] += 1

    conn.commit()
    conn.close()

    print("\n" + "=" * 60)
    print("Database Sync Successful!")
    print(f"Target DB: {target_db_path}")
    print(f"Records updated: {stats['updated']}")
    print(f"New records inserted: {stats['inserted']}")
    print(f"Classes corrected: {stats['class_fixed']}")
    print(f"Student ID typos corrected: {stats['id_fixed']}")
    print(f"Confirmed signatures safely preserved: {stats['signed_preserved']}")
    print("=" * 60)
    return True

if __name__ == "__main__":
    db_target = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_DB
    sync_database(db_target)
