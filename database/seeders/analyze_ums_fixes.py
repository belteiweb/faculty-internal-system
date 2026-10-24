import json
import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('database/seeders/all_ums_it_students.json', 'r', encoding='utf-8') as f:
    ums = json.load(f)

ums_students = ums['students']
print(f"Total students extracted from UMS IT sessions: {len(ums_students)}")

conn = sqlite3.connect('database/database.sqlite')
cursor = conn.cursor()
cursor.execute('SELECT id, student_id, student_id_formatted, name_latin, name_khmer, sex, campus_code, class_code, signed FROM thesis_students')
db_students = cursor.fetchall()
conn.close()

print(f"Total students currently in local DB: {len(db_students)}")

# Index DB by ID and Latin Name
db_by_id = {}
db_by_name = {}
for row in db_students:
    db_id_norm = str(int(row[1])) if str(row[1]).isdigit() else str(row[1])
    db_by_id[db_id_norm] = row
    name_clean = " ".join(row[3].strip().upper().split())
    db_by_name[name_clean] = row

# Comparisons
id_corrected = []
class_corrected = []
matched_ids = set()
new_students = []

for u in ums_students:
    uid = u['student_id']
    uname = " ".join(u['name_latin'].strip().upper().split())
    u_class = u['class_code']
    u_campus = u['campus_code']
    
    if uid in db_by_id:
        matched_ids.add(uid)
        db_row = db_by_id[uid]
        db_class = db_row[7]
        if db_class != u_class:
            class_corrected.append({
                'id': uid,
                'name': u['name_latin'],
                'old_class': db_class,
                'new_class': u_class,
                'campus': u_campus
            })
    elif uname in db_by_name:
        db_row = db_by_name[uname]
        id_corrected.append({
            'name': u['name_latin'],
            'old_id': db_row[1],
            'new_id': uid,
            'old_class': db_row[7],
            'new_class': u_class
        })
    else:
        new_students.append(u)

print("=" * 60)
print(f"1. ID Corrections (typos in old Excel/DB): {len(id_corrected)}")
for item in id_corrected:
    print(f"   - {item['name']}: ID was {item['old_id']} -> Correct UMS ID is {item['new_id']} (Class: {item['old_class']} -> {item['new_class']})")

print(f"\n2. Class Code Corrections: {len(class_corrected)}")
print("   Sample Class corrections (first 15):")
for item in class_corrected[:15]:
    print(f"   - [{item['campus']}] ID {item['id']} ({item['name']}): was '{item['old_class']}' -> now '{item['new_class']}'")

print(f"\n3. Direct ID Matches: {len(matched_ids)}")
print(f"4. Students in UMS not currently in DB: {len(new_students)}")
print("=" * 60)
