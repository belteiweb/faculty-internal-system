import json
import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('database/seeders/ums_students_extracted.json', 'r', encoding='utf-8') as f:
    ums = json.load(f)

ums_students = ums['students']
print(f"Total students extracted from UMS: {len(ums_students)}")

conn = sqlite3.connect('database/database.sqlite')
cursor = conn.cursor()
cursor.execute('SELECT id, student_id, student_id_formatted, name_latin, name_khmer, sex, class_code, campus_code, major_code, score, result_status FROM thesis_students')
db_students = cursor.fetchall()
conn.close()

db_by_id = {}
db_by_name = {}
for row in db_students:
    db_id = str(int(row[1])) if row[1].isdigit() else row[1]
    db_by_id[db_id] = row
    clean_name = row[3].strip().upper()
    db_by_name[clean_name] = row

print(f"Total students in DB: {len(db_students)}")

matched_by_id = 0
matched_by_name_different_id = []
not_in_db = []
class_diffs = []

for u in ums_students:
    uid = u['student_id_norm']
    uname = u['latin_name'].strip().upper()
    
    if uid in db_by_id:
        matched_by_id += 1
        db_row = db_by_id[uid]
        db_class = db_row[6]
        ums_class = u.get('class_code', '')
        if db_class != ums_class:
            class_diffs.append({
                'id': uid,
                'name': u['latin_name'],
                'db_class': db_class,
                'ums_class': ums_class,
                'session': u['session_id']
            })
    elif uname in db_by_name:
        db_row = db_by_name[uname]
        matched_by_name_different_id.append({
            'name': u['latin_name'],
            'ums_id': uid,
            'db_id': db_row[1],
            'db_class': db_row[6],
            'ums_class': u.get('class_code', ''),
            'session': u['session_id']
        })
    else:
        not_in_db.append(u)

print("=" * 60)
print(f"Direct ID matches: {matched_by_id}")
print(f"Same Name but DIFFERENT ID in DB: {len(matched_by_name_different_id)}")
print(f"Students in UMS not found in DB at all: {len(not_in_db)}")
print(f"Class mismatches among ID matches: {len(class_diffs)}")
print("=" * 60)

if matched_by_name_different_id:
    print("\n--- STUDENTS WITH DIFFERENT IDs (Typo in DB/Excel) ---")
    for diff in matched_by_name_different_id:
        print(f"  {diff['name']}: DB ID = {diff['db_id']} vs UMS ID = {diff['ums_id']} (Class: DB '{diff['db_class']}' vs UMS '{diff['ums_class']}')")

if class_diffs:
    print(f"\n--- SAMPLE CLASS MISMATCHES ({len(class_diffs)} total) ---")
    for d in class_diffs[:20]:
        print(f"  ID {d['id']} ({d['name']}): DB = '{d['db_class']}' -> UMS Session {d['session']} = '{d['ums_class']}'")

if not_in_db:
    print(f"\n--- STUDENTS IN UMS NOT IN DB ({len(not_in_db)} total) ---")
    for s in not_in_db[:15]:
        print(f"  ID {s['student_id']} ({s['latin_name']}) - Session {s['session_id']} ({s.get('major')})")
