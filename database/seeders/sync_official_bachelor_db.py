import json
import sqlite3
import os
import shutil
import sys
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_DB = os.path.join(BASE_DIR, "database", "database.sqlite")
OFFICIAL_DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "official_bachelor_thesis_students.json")

# Known ID typos corrected to match official UMS system
KNOWN_ID_CORRECTIONS = {
    "61797": "61798", # SAMRITH RATH
    "61803": "61805", # VORN SAVORN
}

def sync_official_database(target_db_path=DEFAULT_DB):
    if not os.path.exists(target_db_path):
        print(f"ERROR: Target database not found at {target_db_path}")
        return False

    if not os.path.exists(OFFICIAL_DATA_FILE):
        print(f"ERROR: Official UMS data file not found at {OFFICIAL_DATA_FILE}")
        return False

    with open(OFFICIAL_DATA_FILE, "r", encoding="utf-8") as f:
        official_data = json.load(f)
    official_students = official_data.get("students", [])

    print(f"Loaded {len(official_students)} official Bachelor students from UMS.")

    # 1. Create a safe backup before any modifications
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{target_db_path}.bak.{timestamp}"
    shutil.copy2(target_db_path, backup_path)
    print(f"Created safety backup at: {backup_path}")

    conn = sqlite3.connect(target_db_path)
    cursor = conn.cursor()

    initial_signed_count = cursor.execute("SELECT COUNT(*) FROM thesis_students WHERE signed = 1").fetchone()[0]
    initial_total_count = cursor.execute("SELECT COUNT(*) FROM thesis_students").fetchone()[0]
    print(f"Initial target DB: {initial_total_count} total students, {initial_signed_count} signed students.")

    # Load existing signatures to guarantee 0 data loss
    cursor.execute("""
        SELECT student_id, student_id_formatted, name_latin, signed, signed_at, signature_notes, signed_device_ip 
        FROM thesis_students 
        WHERE signed = 1
    """)
    signed_records = cursor.fetchall()

    # Map signed info by student_id and by normalized name
    signed_map_by_id = {}
    signed_map_by_name = {}
    for r in signed_records:
        sid_norm = str(int(r[0])) if str(r[0]).isdigit() else str(r[0])
        signed_map_by_id[sid_norm] = r
        clean_name = " ".join(r[2].strip().upper().split())
        signed_map_by_name[clean_name] = r

    # Also map known ID corrections so signed status carries over
    for old_id, new_id in KNOWN_ID_CORRECTIONS.items():
        if old_id in signed_map_by_id and new_id not in signed_map_by_id:
            signed_map_by_id[new_id] = signed_map_by_id[old_id]

    stats = {
        "updated": 0,
        "inserted": 0,
        "removed_extra_unsigned": 0,
        "id_fixed": 0,
        "signed_preserved": 0
    }

    processed_ids = set()

    for u in official_students:
        uid = str(int(u["student_id"])) if str(u["student_id"]).isdigit() else str(u["student_id"])
        fmt_id = u["student_id_formatted"]
        uname_clean = " ".join(u["name_latin"].strip().upper().split())
        processed_ids.add(uid)

        # Check if student exists in DB by ID or by known correction or name
        cursor.execute("SELECT id, student_id, class_code, signed, signed_at, signature_notes, signed_device_ip, score, result_status FROM thesis_students WHERE student_id = ? OR student_id_formatted = ?", (uid, fmt_id))
        existing = cursor.fetchone()

        if not existing:
            # Check if this student had a typo ID in the old DB
            for old_id, correct_id in KNOWN_ID_CORRECTIONS.items():
                if correct_id == uid:
                    cursor.execute("SELECT id, student_id, class_code, signed, signed_at, signature_notes, signed_device_ip, score, result_status FROM thesis_students WHERE student_id = ?", (old_id,))
                    existing = cursor.fetchone()
                    if existing:
                        stats["id_fixed"] += 1
                        print(f"   [ID Correction] Updating student record {existing[0]}: {old_id} -> {uid} ({u['name_latin']})")
                    break

        if not existing:
            # Check by exact name match
            cursor.execute("SELECT id, student_id, class_code, signed, signed_at, signature_notes, signed_device_ip, score, result_status FROM thesis_students WHERE UPPER(name_latin) = ?", (u["name_latin"].strip().upper(),))
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

        topic_q_json = json.dumps(u.get("topic_questions", []), ensure_ascii=False) if u.get("topic_questions") else None

        # Score & result: use UMS score if present, else keep existing if evaluated
        final_score = u["score"] if u.get("score") is not None else (existing[7] if existing else None)
        final_result = u["result_status"] if u.get("result_status") and u["result_status"] != "PENDING" else (existing[8] if existing and existing[8] else "PENDING")

        if existing:
            rec_id = existing[0]
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
                    academic_year = '2023-2024',
                    group_no = COALESCE(?, group_no),
                    supervisor_name = COALESCE(NULLIF(?, ''), supervisor_name),
                    supervisor_phone = COALESCE(NULLIF(?, ''), supervisor_phone),
                    topic_title = COALESCE(NULLIF(?, ''), topic_title),
                    topic_questions = COALESCE(?, topic_questions),
                    score = ?,
                    result_status = ?,
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
                u["supervisor_name"],
                u["supervisor_phone"],
                u["topic_title"],
                topic_q_json,
                final_score,
                final_result,
                is_signed,
                signed_at,
                sig_notes,
                sig_ip,
                rec_id
            ))
            stats["updated"] += 1
        else:
            # Insert new student from official UMS list
            cursor.execute("""
                INSERT INTO thesis_students (
                    student_id, student_id_formatted, name_latin, name_khmer, sex, phone,
                    campus_code, campus_name, major_code, major_name, class_code, shift, batch,
                    academic_year, group_no, supervisor_name, supervisor_phone, topic_title, topic_questions,
                    score, result_status, signed, signed_at, signature_notes, signed_device_ip,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '2023-2024', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
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
                u["supervisor_name"],
                u["supervisor_phone"],
                u["topic_title"],
                topic_q_json,
                final_score,
                final_result,
                is_signed,
                signed_at,
                sig_notes,
                sig_ip
            ))
            stats["inserted"] += 1

    # Remove non-official students who NEVER signed (keep anyone who signed!)
    cursor.execute("SELECT id, student_id, name_latin, signed FROM thesis_students")
    all_current = cursor.fetchall()
    for row in all_current:
        row_id, row_sid, row_name, row_signed = row
        sid_clean = str(int(row_sid)) if str(row_sid).isdigit() else str(row_sid)
        if sid_clean not in processed_ids and row_signed == 0:
            cursor.execute("DELETE FROM thesis_students WHERE id = ?", (row_id,))
            stats["removed_extra_unsigned"] += 1

    # Update supervisors table and link supervisor_id
    cursor.execute("""
        SELECT DISTINCT supervisor_name, supervisor_phone, campus_code 
        FROM thesis_students 
        WHERE supervisor_name IS NOT NULL AND supervisor_name != ''
    """)
    distinct_sups = cursor.fetchall()
    for sup_name, sup_phone, sup_camp in distinct_sups:
        cursor.execute("SELECT id FROM supervisors WHERE UPPER(name) = ?", (sup_name.strip().upper(),))
        sup_row = cursor.fetchone()
        if sup_row:
            sup_id = sup_row[0]
            if sup_phone:
                cursor.execute("UPDATE supervisors SET phone = COALESCE(NULLIF(phone, ''), ?), campus_code = ? WHERE id = ?", (sup_phone, sup_camp, sup_id))
        else:
            cursor.execute("""
                INSERT INTO supervisors (name, phone, title, campus_code, created_at, updated_at)
                VALUES (?, ?, 'Lecturer', ?, datetime('now'), datetime('now'))
            """, (sup_name, sup_phone, sup_camp))
            sup_id = cursor.lastrowid

        cursor.execute("UPDATE thesis_students SET supervisor_id = ? WHERE UPPER(supervisor_name) = ?", (sup_id, sup_name.strip().upper()))

    # Final signature integrity check
    final_signed_count = cursor.execute("SELECT COUNT(*) FROM thesis_students WHERE signed = 1").fetchone()[0]
    final_total_count = cursor.execute("SELECT COUNT(*) FROM thesis_students").fetchone()[0]

    if final_signed_count < initial_signed_count:
        conn.rollback()
        conn.close()
        raise RuntimeError(f"CRITICAL ERROR: Signature loss detected! Initial: {initial_signed_count}, Final: {final_signed_count}. Transaction rolled back.")

    conn.commit()
    conn.close()

    # Also create cleanly named export for uploading to production
    downloads_dir = os.path.dirname(target_db_path)
    clean_export_path = os.path.join(downloads_dir, "database_synced_production.sqlite")
    shutil.copy2(target_db_path, clean_export_path)

    print("\n" + "=" * 60)
    print("Official Bachelor Thesis Database Sync Successful!")
    print(f"Target DB: {target_db_path}")
    print(f"Clean Export: {clean_export_path}")
    print(f"Total students: {initial_total_count} -> {final_total_count}")
    print(f"Records updated: {stats['updated']}")
    print(f"New records inserted: {stats['inserted']}")
    print(f"Removed extra unsigned students: {stats['removed_extra_unsigned']}")
    print(f"Student ID typos corrected: {stats['id_fixed']}")
    print(f"Confirmed signatures safely preserved: {final_signed_count} (100% intact)")
    print("=" * 60)
    return True

if __name__ == "__main__":
    db_target = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_DB
    sync_official_database(db_target)
