import sys
import os
import asyncio
import json

sys.stdout.reconfigure(encoding='utf-8')
UMS_DIR = r"d:\1. Work\Thesis\Bachelor\Batch 6\UMS-System"
sys.path.insert(0, UMS_DIR)

from ums_client import UMSClient, BASE_URL

OUTPUT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ums_students_extracted.json")

async def extract_all():
    client = UMSClient(headless=True)
    await client.start()
    
    logged_in = await client.login_if_needed()
    if not logged_in:
        print("ERROR: Could not log in to UMS!")
        await client.close()
        return

    print("Fetching all thesis sessions from UMS...")
    sessions_dict = await client.fetch_user_thesis_sessions(save_to_file=False)
    sessions = sessions_dict.get("sessions", [])
    print(f"Discovered {len(sessions)} sessions in UMS.")
    
    all_extracted_students = []
    
    for s_idx, session in enumerate(sessions, 1):
        sid = session.get("session_id")
        campus_name = session.get("campus_name", "")
        campus_code = session.get("campus_code", "UC1")
        major = session.get("major", "")
        class_code = session.get("class_code", "")
        batch = session.get("batch", "")
        degree = session.get("degree", "")
        
        print(f"[{s_idx}/{len(sessions)}] Processing Session {sid}: {campus_name} | {major} | Class: {class_code} | Batch: {batch}...")
        
        try:
            students = await client.get_session_students(sid)
            print(f"   -> Retrieved {len(students)} students from session {sid}")
            
            for st in students:
                st["session_id"] = sid
                st["campus_name"] = campus_name
                st["campus_code"] = campus_code
                st["major"] = major
                st["class_code"] = class_code
                st["batch"] = batch
                st["degree"] = degree
                all_extracted_students.append(st)
        except Exception as e:
            print(f"   -> ERROR getting students for session {sid}: {e}")

    await client.close()
    
    print(f"\nTotal students extracted across all sessions: {len(all_extracted_students)}")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump({
            "total": len(all_extracted_students),
            "sessions": sessions,
            "students": all_extracted_students
        }, f, ensure_ascii=False, indent=2)
        
    print(f"Saved complete UMS dataset to: {OUTPUT_FILE}")

if __name__ == "__main__":
    asyncio.run(extract_all())
