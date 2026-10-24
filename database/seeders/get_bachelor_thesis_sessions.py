import json
import sys
import requests

sys.stdout.reconfigure(encoding='utf-8')
AUTH_PATH = r"d:\1. Work\Thesis\Bachelor\Batch 6\UMS-System\auth.json"

with open(AUTH_PATH, "r", encoding="utf-8") as f:
    auth_data = json.load(f)

cookies = {c["name"]: c["value"] for c in auth_data["cookies"]}
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "X-Requested-With": "XMLHttpRequest",
    "Accept": "application/json, text/javascript, */*; q=0.01"
}

all_bachelor_sessions = []

for cid, cname in [(2, "Campus 1 (Tuol Sleng)"), (3, "Campus 2 (Chom Chao)")]:
    resp = requests.get("https://ums.beltei.edu.kh/research-education/thesis", 
                        params={"draw": 1, "start": 0, "length": 100, "campus_id": [cid]}, 
                        cookies=cookies, headers=headers)
    data = resp.json()
    for r in data.get("data", []):
        degree = r.get("degree_name", "")
        if "Bachelor" in degree:
            all_bachelor_sessions.append({
                "campus_name_en": cname,
                **r
            })

print(f"\nTotal Bachelor's Thesis Sessions: {len(all_bachelor_sessions)}")
total_students = 0
for s in all_bachelor_sessions:
    st_count = int(s.get("students_count") or 0)
    total_students += st_count
    print(f"ID {s['id']:2d} | {s['campus_name_en']} | {s['degree_name']} | {s['major_name']} | Class: {s['class_name']} | Groups: {s['groups_count']} | Students: {s['students_count']}")

print(f"\nTOTAL OFFICIAL STUDENTS ACROSS ALL BACHELOR SESSIONS: {total_students}")
