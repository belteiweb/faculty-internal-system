import json
import re
import sys
import time
import requests
from bs4 import BeautifulSoup

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

def clean_text(s):
    if not s:
        return ""
    return re.sub(r'\s+', ' ', s).strip()

def get_bachelor_sessions():
    sessions = []
    for cid, ccode, cname in [(2, "UC1", "Campus 1 (Tuol Sleng)"), (3, "UC2", "Campus 2 (Chom Chao)")]:
        resp = requests.get("https://ums.beltei.edu.kh/research-education/thesis", 
                            params={"draw": 1, "start": 0, "length": 100, "campus_id": [cid]}, 
                            cookies=cookies, headers=headers)
        data = resp.json()
        for r in data.get("data", []):
            degree = r.get("degree_name", "")
            if "Bachelor" in degree:
                raw_major = BeautifulSoup(r.get("major_name", ""), "html.parser").get_text(" ", strip=True)
                m_code = "SE"
                if "Multimedia" in raw_major:
                    m_code = "CMD"
                elif "Networking" in raw_major or "Cyber" in raw_major:
                    m_code = "CNCS"
                
                batch_str = "Batch VI"
                if "Batch 5" in raw_major or "Batch: V" in raw_major:
                    batch_str = "Batch V"
                elif "Batch 4" in raw_major:
                    batch_str = "Batch IV"
                elif "Batch 6" in raw_major:
                    batch_str = "Batch VI"

                raw_class = clean_text(r.get("class_name", ""))
                shift = "Evening"
                if "Mor" in raw_class:
                    shift = "Morning"
                    norm_class = f"{m_code}-Mor1"
                elif "SS" in raw_class:
                    shift = "Weekend"
                    norm_class = f"{m_code}-SS1"
                else:
                    num_match = re.search(r'\d+', raw_class)
                    num = num_match.group(0) if num_match else "1"
                    norm_class = f"{m_code}-E{num}"

                major_full = "Software Engineering"
                if m_code == "CMD":
                    major_full = "Computer Multimedia Design"
                elif m_code == "CNCS":
                    major_full = "Computer Networking & Cyber Security"

                sessions.append({
                    "id": r["id"],
                    "campus_code": ccode,
                    "campus_name": cname,
                    "major_code": m_code,
                    "major_name": major_full,
                    "class_code": norm_class,
                    "raw_class": raw_class,
                    "shift": shift,
                    "batch": batch_str,
                    "expected_students": int(r.get("students_count") or 0),
                    "expected_groups": int(r.get("groups_count") or 0)
                })
    return sessions

def scrape_all_sessions(sessions):
    all_students = []
    headers_html = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

    for idx, s in enumerate(sessions):
        sid = s["id"]
        print(f"[{idx+1:2d}/{len(sessions)}] Session {sid:2d}: {s['campus_code']} | {s['class_code']} ({s['major_name']}) ...")
        
        students_dict = {}
        group_supervisors = {}
        student_assigned_group = {}

        # 1. Manage Page
        url_manage = f"https://ums.beltei.edu.kh/research-education/thesis/manage/{sid}"
        resp_m = requests.get(url_manage, cookies=cookies, headers=headers_html)
        soup_m = BeautifulSoup(resp_m.text, "html.parser")
        tables_m = soup_m.find_all("table")

        if len(tables_m) > 1:
            sup_table = tables_m[1]
            tbody = sup_table.find("tbody")
            if tbody:
                direct_trs = tbody.find_all("tr", recursive=False)
                current_sup = None
                for tr in direct_trs:
                    tds = tr.find_all("td", recursive=False)
                    if len(tds) >= 3 and tds[0].get_text(strip=True).isdigit():
                        grp_num = int(tds[0].get_text(strip=True))
                        name_el = tds[1].find("div", class_="font-weight-semibold")
                        sup_name = clean_text(name_el.get_text()) if name_el else clean_text(tds[1].get_text())
                        sup_name = re.sub(r'Lecturer|Professor|Dr\.|Assistant|Office Staff|Dean|Vice Dean', '', sup_name, flags=re.I).strip()
                        phone = clean_text(tds[2].get_text())
                        
                        current_sup = {"name": sup_name, "phone": phone, "group_no": grp_num}
                        group_supervisors[grp_num] = current_sup

                    # If this is the detail card row, find all assigned student IDs
                    if current_sup and len(tds) == 1:
                        card_text = tds[0].get_text()
                        st_ids = re.findall(r'\b000\d{5}\b|\b[56]\d{4}\b', card_text)
                        for sid_match in st_ids:
                            num_id = str(int(sid_match)) if sid_match.isdigit() else sid_match
                            student_assigned_group[num_id] = current_sup

        if tables_m:
            # Table 1: Students
            for r in tables_m[0].find_all("tr")[1:]:
                tds = r.find_all("td")
                if len(tds) >= 6:
                    raw_id = clean_text(tds[2].get_text())
                    if not raw_id:
                        continue
                    num_id = str(int(raw_id)) if raw_id.isdigit() else raw_id
                    fmt_id = num_id.zfill(8)

                    name_spans = tds[3].find_all("span")
                    name_latin = clean_text(name_spans[0].get_text()) if len(name_spans) > 0 else clean_text(tds[3].get_text())
                    name_khmer = clean_text(name_spans[1].get_text()) if len(name_spans) > 1 else ""

                    sex = clean_text(tds[4].get_text())
                    phone = clean_text(tds[5].get_text())

                    group_text = clean_text(tds[6].get_text()) if len(tds) > 6 else ""
                    grp_m = re.search(r'\d+', group_text)
                    group_no = int(grp_m.group(0)) if grp_m else None

                    # Supervisor info from card or group
                    sup_info = student_assigned_group.get(num_id) or group_supervisors.get(group_no, {})
                    sup_name = sup_info.get("name", "")
                    sup_phone = sup_info.get("phone", "")
                    if not group_no and sup_info.get("group_no"):
                        group_no = sup_info.get("group_no")

                    students_dict[num_id] = {
                        "session_id": sid,
                        "student_id": num_id,
                        "student_id_formatted": fmt_id,
                        "name_latin": name_latin,
                        "name_khmer": name_khmer,
                        "sex": sex,
                        "phone": phone,
                        "campus_code": s["campus_code"],
                        "campus_name": s["campus_name"],
                        "major_code": s["major_code"],
                        "major_name": s["major_name"],
                        "class_code": s["class_code"],
                        "shift": s["shift"],
                        "batch": s["batch"],
                        "academic_year": "2023-2024",
                        "group_no": group_no,
                        "supervisor_name": sup_name,
                        "supervisor_phone": sup_phone,
                        "topic_title": "",
                        "topic_questions": [],
                        "score": None,
                        "result_status": "PENDING"
                    }

        # 2. Reports: Topics
        url_topics = f"https://ums.beltei.edu.kh/research-education/thesis/{sid}/reports/topics"
        resp_t = requests.get(url_topics, cookies=cookies, headers=headers_html)
        soup_t = BeautifulSoup(resp_t.text, "html.parser")
        t_table = soup_t.find("table")
        
        # Track last seen supervisor in topic table for rows where cell was visually merged
        last_topic_sup_name = ""
        last_topic_sup_phone = ""
        last_topic_grp = None

        if t_table:
            for r in t_table.find_all("tr")[1:]:
                tds = r.find_all("td")
                if len(tds) >= 7:
                    raw_id = clean_text(tds[1].get_text())
                    if not raw_id:
                        continue
                    num_id = str(int(raw_id)) if raw_id.isdigit() else raw_id

                    topic_cell = tds[4]
                    title_el = topic_cell.find("span", class_="thesis-topic-title")
                    topic_title = clean_text(title_el.get_text()) if title_el else ""

                    questions = []
                    q_ol = topic_cell.find("ol", class_="thesis-topic-questions")
                    if q_ol:
                        for li in q_ol.find_all("li"):
                            q_text = clean_text(li.get_text())
                            if q_text:
                                questions.append(q_text)

                    grp_str = clean_text(tds[5].get_text())
                    grp_m = re.search(r'\d+', grp_str)
                    row_grp = int(grp_m.group(0)) if grp_m else None

                    sup_text = clean_text(tds[6].get_text())
                    if sup_text:
                        phone_match = re.search(r'(\+?\d[\d\s\/\-]{7,})', sup_text)
                        sup_phone = phone_match.group(0).strip() if phone_match else ""
                        sup_name = clean_text(sup_text.replace(sup_phone, ""))
                        # Check it's not numbers
                        if not re.match(r'^\d+$', sup_name):
                            last_topic_sup_name = sup_name
                            last_topic_sup_phone = sup_phone
                            last_topic_grp = row_grp
                    elif row_grp == last_topic_grp and last_topic_sup_name:
                        sup_name = last_topic_sup_name
                        sup_phone = last_topic_sup_phone
                    else:
                        sup_name = ""
                        sup_phone = ""

                    if num_id in students_dict:
                        if topic_title:
                            students_dict[num_id]["topic_title"] = topic_title
                        if questions:
                            students_dict[num_id]["topic_questions"] = questions
                        if row_grp and not students_dict[num_id]["group_no"]:
                            students_dict[num_id]["group_no"] = row_grp
                        # Update supervisor name if valid text
                        if sup_name and not re.match(r'^\d+$', sup_name):
                            students_dict[num_id]["supervisor_name"] = sup_name
                        if sup_phone:
                            students_dict[num_id]["supervisor_phone"] = sup_phone

        # 3. Reports: Results
        url_results = f"https://ums.beltei.edu.kh/research-education/thesis/{sid}/reports/results"
        resp_r = requests.get(url_results, cookies=cookies, headers=headers_html)
        soup_r = BeautifulSoup(resp_r.text, "html.parser")
        r_table = soup_r.find("table")
        if r_table:
            for r in r_table.find_all("tr")[1:]:
                tds = r.find_all("td")
                if len(tds) >= 6:
                    raw_id = clean_text(tds[1].get_text())
                    if not raw_id:
                        continue
                    num_id = str(int(raw_id)) if raw_id.isdigit() else raw_id

                    marks_str = clean_text(tds[4].get_text())
                    score = float(marks_str) if marks_str and marks_str.replace('.', '', 1).isdigit() else None
                    res_status = clean_text(tds[5].get_text()).upper()
                    if not res_status:
                        res_status = "PASS" if score and score >= 50 else "PENDING"

                    if num_id in students_dict:
                        students_dict[num_id]["score"] = score
                        students_dict[num_id]["result_status"] = res_status

        all_students.extend(students_dict.values())
        time.sleep(0.3)

    return all_students

if __name__ == "__main__":
    sessions = get_bachelor_sessions()
    print(f"Scraping all {len(sessions)} sessions with accurate supervisor parsing...")
    students = scrape_all_sessions(sessions)
    print(f"\nTotal extracted: {len(students)}")

    # Verify supervisor names
    invalid_sups = [s for s in students if re.match(r'^\d+$', s['supervisor_name']) or not s['supervisor_name']]
    print(f"Invalid / empty supervisor count: {len(invalid_sups)}")
    if invalid_sups:
        for s in invalid_sups[:10]:
            print("  Invalid:", s['student_id'], s['name_latin'], s['class_code'], "Sup:", s['supervisor_name'])

    # Check BE KEABIN
    bk = [s for s in students if s['student_id'] == '58076']
    if bk:
        print("\nBE KEABIN:", bk[0]['student_id'], bk[0]['name_latin'], "Supervisor:", bk[0]['supervisor_name'], "Phone:", bk[0]['supervisor_phone'])

    # Save to json
    out_file = "d:/Project/Faculty-System/database/seeders/official_bachelor_thesis_students.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({
            "total": len(students),
            "sessions": sessions,
            "students": students
        }, f, ensure_ascii=False, indent=2)
    print(f"Saved dataset to {out_file}")
