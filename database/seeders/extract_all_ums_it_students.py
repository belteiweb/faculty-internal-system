import asyncio
import sys
import os
import json
import re

sys.stdout.reconfigure(encoding='utf-8')
UMS_DIR = r"d:\1. Work\Thesis\Bachelor\Batch 6\UMS-System"
sys.path.insert(0, UMS_DIR)

from ums_client import UMSClient, BASE_URL

OUTPUT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "all_ums_it_students.json")

# Mapping of known IT sessions in UMS
IT_SESSIONS_CONFIG = {
    # Campus 2 (Chom Chao)
    22: {"campus_code": "UC2", "campus_name": "Campus 2 (Chom Chao)", "major_code": "SE", "major_name": "Software Engineering", "class_code": "SE-E1", "shift": "Evening", "batch": "Batch VI"},
    23: {"campus_code": "UC2", "campus_name": "Campus 2 (Chom Chao)", "major_code": "SE", "major_name": "Software Engineering", "class_code": "SE-E2", "shift": "Evening", "batch": "Batch VI"},
    27: {"campus_code": "UC2", "campus_name": "Campus 2 (Chom Chao)", "major_code": "SE", "major_name": "Software Engineering", "class_code": "SE-E3", "shift": "Evening", "batch": "Batch VI"},
    50: {"campus_code": "UC2", "campus_name": "Campus 2 (Chom Chao)", "major_code": "SE", "major_name": "Software Engineering", "class_code": "SE-Mor1", "shift": "Morning", "batch": "Batch VI"},
    28: {"campus_code": "UC2", "campus_name": "Campus 2 (Chom Chao)", "major_code": "CNCS", "major_name": "Computer Networking & Cyber Security", "class_code": "CNCS-E1", "shift": "Evening", "batch": "Batch IV"},
    29: {"campus_code": "UC2", "campus_name": "Campus 2 (Chom Chao)", "major_code": "CMD", "major_name": "Computer Multimedia Design", "class_code": "CMD-E1", "shift": "Evening", "batch": "Batch V"},
    30: {"campus_code": "UC2", "campus_name": "Campus 2 (Chom Chao)", "major_code": "CMD", "major_name": "Computer Multimedia Design", "class_code": "CMD-E2", "shift": "Evening", "batch": "Batch V"},
    31: {"campus_code": "UC2", "campus_name": "Campus 2 (Chom Chao)", "major_code": "CMD", "major_name": "Computer Multimedia Design", "class_code": "CMD-E3", "shift": "Evening", "batch": "Batch V"},
    81: {"campus_code": "UC2", "campus_name": "Campus 2 (Chom Chao)", "major_code": "SE", "major_name": "Software Engineering", "class_code": "SE-SS1", "shift": "Weekend", "batch": "Batch V"},

    # Campus 1 (Tuol Sleng)
    32: {"campus_code": "UC1", "campus_name": "Campus 1 (Tuol Sleng)", "major_code": "SE", "major_name": "Software Engineering", "class_code": "SE-E1", "shift": "Evening", "batch": "Batch VI"},
    33: {"campus_code": "UC1", "campus_name": "Campus 1 (Tuol Sleng)", "major_code": "SE", "major_name": "Software Engineering", "class_code": "SE-E2", "shift": "Evening", "batch": "Batch VI"},
    34: {"campus_code": "UC1", "campus_name": "Campus 1 (Tuol Sleng)", "major_code": "SE", "major_name": "Software Engineering", "class_code": "SE-E3", "shift": "Evening", "batch": "Batch VI"},
    40: {"campus_code": "UC1", "campus_name": "Campus 1 (Tuol Sleng)", "major_code": "SE", "major_name": "Software Engineering", "class_code": "SE-Mor1", "shift": "Morning", "batch": "Batch VI"},
    35: {"campus_code": "UC1", "campus_name": "Campus 1 (Tuol Sleng)", "major_code": "CMD", "major_name": "Computer Multimedia Design", "class_code": "CMD-E1", "shift": "Evening", "batch": "Batch V"},
    36: {"campus_code": "UC1", "campus_name": "Campus 1 (Tuol Sleng)", "major_code": "CMD", "major_name": "Computer Multimedia Design", "class_code": "CMD-E2", "shift": "Evening", "batch": "Batch V"},
    37: {"campus_code": "UC1", "campus_name": "Campus 1 (Tuol Sleng)", "major_code": "CMD", "major_name": "Computer Multimedia Design", "class_code": "CMD-E3", "shift": "Evening", "batch": "Batch V"},
    38: {"campus_code": "UC1", "campus_name": "Campus 1 (Tuol Sleng)", "major_code": "CMD", "major_name": "Computer Multimedia Design", "class_code": "CMD-E4", "shift": "Evening", "batch": "Batch V"},
    51: {"campus_code": "UC1", "campus_name": "Campus 1 (Tuol Sleng)", "major_code": "CMD", "major_name": "Computer Multimedia Design", "class_code": "CMD-SS1", "shift": "Weekend", "batch": "Batch V"},
    39: {"campus_code": "UC1", "campus_name": "Campus 1 (Tuol Sleng)", "major_code": "CNCS", "major_name": "Computer Networking & Cyber Security", "class_code": "CNCS-E1", "shift": "Evening", "batch": "Batch IV"},
    60: {"campus_code": "UC1", "campus_name": "Campus 1 (Tuol Sleng)", "major_code": "SE", "major_name": "Software Engineering", "class_code": "SE-SS1", "shift": "Weekend", "batch": "Batch V"},
    61: {"campus_code": "UC1", "campus_name": "Campus 1 (Tuol Sleng)", "major_code": "CMD", "major_name": "Computer Multimedia Design", "class_code": "CMD-SS1", "shift": "Weekend", "batch": "Batch IV"},
    62: {"campus_code": "UC1", "campus_name": "Campus 1 (Tuol Sleng)", "major_code": "CMD", "major_name": "Computer Multimedia Design", "class_code": "CMD-SS1", "shift": "Weekend", "batch": "Batch II"},
}

async def extract_all_it_sessions():
    client = UMSClient(headless=True)
    await client.start()
    
    logged_in = await client.login_if_needed()
    if not logged_in:
        print("ERROR: Could not log in to UMS!", flush=True)
        await client.close()
        return

    print(f"Beginning extraction for {len(IT_SESSIONS_CONFIG)} IT thesis sessions...", flush=True)
    all_students = []
    session_summaries = []

    for sid, cfg in sorted(IT_SESSIONS_CONFIG.items()):
        print(f"\n[Session {sid}] {cfg['campus_name']} | {cfg['major_name']} | Class: {cfg['class_code']}...", flush=True)
        try:
            students = await client.get_session_students(sid)
            print(f"   -> Successfully extracted {len(students)} students from Session {sid}", flush=True)
            
            for st in students:
                raw_full = st.get("full_name", "")
                parts = [p.strip() for p in raw_full.split("\n") if p.strip()]
                latin_name = parts[0] if parts else st.get("latin_name", "")
                khmer_name = parts[1] if len(parts) > 1 else ""
                
                raw_sid = str(st.get("student_id", "")).strip()
                norm_sid = str(int(raw_sid)) if raw_sid.isdigit() else raw_sid
                fmt_sid = f"{int(raw_sid):08d}" if raw_sid.isdigit() else raw_sid
                
                group_val = st.get("group", "")
                group_num = int(group_val) if group_val and group_val.isdigit() else None
                
                mark_val = st.get("mark", "")
                score = float(mark_val) if mark_val and mark_val.replace(".", "", 1).isdigit() else None
                
                res_status = st.get("result", "PENDING").strip().upper()
                if "PASS" in res_status:
                    clean_result = "PASS"
                elif "FAIL" in res_status or "REPEAT" in res_status:
                    clean_result = "REPEAT"
                else:
                    clean_result = "PENDING"
                
                record = {
                    "session_id": sid,
                    "enroll_id": st.get("enroll_id"),
                    "no": st.get("no"),
                    "student_id": norm_sid,
                    "student_id_formatted": fmt_sid,
                    "name_latin": latin_name,
                    "name_khmer": khmer_name,
                    "sex": st.get("sex", "M"),
                    "phone": st.get("phone", ""),
                    "campus_code": cfg["campus_code"],
                    "campus_name": cfg["campus_name"],
                    "major_code": cfg["major_code"],
                    "major_name": cfg["major_name"],
                    "class_code": cfg["class_code"],
                    "shift": cfg["shift"],
                    "batch": cfg["batch"],
                    "group_no": group_num,
                    "topic_raw": st.get("topic", ""),
                    "score": score,
                    "result_status": clean_result,
                    "status_remark": st.get("status", "")
                }
                all_students.append(record)
                
            session_summaries.append({
                "session_id": sid,
                "config": cfg,
                "student_count": len(students)
            })
        except Exception as e:
            print(f"   -> ERROR extracting Session {sid}: {e}", flush=True)

    await client.close()
    
    print("\n" + "=" * 60, flush=True)
    print(f"Extraction Complete! Total IT students extracted: {len(all_students)}", flush=True)
    print("=" * 60, flush=True)
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump({
            "total": len(all_students),
            "sessions": session_summaries,
            "students": all_students
        }, f, ensure_ascii=False, indent=2)
        
    print(f"Saved complete authoritative UMS data to: {OUTPUT_FILE}", flush=True)

if __name__ == "__main__":
    asyncio.run(extract_all_it_sessions())
