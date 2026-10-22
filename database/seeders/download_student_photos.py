import os
import sys
import time
import ssl
import io
import sqlite3
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image, ImageOps

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, "database", "database.sqlite")
OUT_DIR = os.path.join(BASE_DIR, "public", "images", "students")

os.makedirs(OUT_DIR, exist_ok=True)

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def compress_and_save(raw_bytes, target_path):
    img = Image.open(io.BytesIO(raw_bytes))
    img = ImageOps.exif_transpose(img)
    
    if img.mode != 'RGB':
        img = img.convert('RGB')
        
    w, h = img.size
    # If image width is larger than 480px, scale down proportionally
    if w > 480:
        new_h = int(h * (480.0 / w))
        img = img.resize((480, new_h), Image.Resampling.LANCZOS)
        
    # Save optimized progressive JPEG
    img.save(target_path, format="JPEG", quality=82, optimize=True, progressive=True)

def download_one(student):
    student_id, fmt_id, name = student
    fmt_id = str(fmt_id).strip()
    target_path = os.path.join(OUT_DIR, f"{fmt_id}.jpg")
    
    # If already downloaded and valid
    if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
        return {
            "status": "cached",
            "student_id": student_id,
            "fmt_id": fmt_id,
            "name": name,
            "saved_bytes": os.path.getsize(target_path),
            "raw_bytes": 0
        }
        
    url = f"https://ums.beltei.edu.kh/storage/uploads/images/students/{fmt_id}.jpg"
    
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=12, context=ssl_ctx) as resp:
                if resp.status == 200:
                    data = resp.read()
                    compress_and_save(data, target_path)
                    saved_size = os.path.getsize(target_path)
                    return {
                        "status": "downloaded",
                        "student_id": student_id,
                        "fmt_id": fmt_id,
                        "name": name,
                        "raw_bytes": len(data),
                        "saved_bytes": saved_size
                    }
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return {
                    "status": "not_found",
                    "student_id": student_id,
                    "fmt_id": fmt_id,
                    "name": name,
                    "error": "404 Not Found"
                }
            time.sleep(1)
        except Exception as e:
            if attempt == 2:
                return {
                    "status": "error",
                    "student_id": student_id,
                    "fmt_id": fmt_id,
                    "name": name,
                    "error": str(e)
                }
            time.sleep(1)
            
    return {
        "status": "error",
        "student_id": student_id,
        "fmt_id": fmt_id,
        "name": name,
        "error": "Max retries reached"
    }

def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT student_id, student_id_formatted, name_latin FROM thesis_students ORDER BY id ASC")
    students = cursor.fetchall()
    conn.close()

    total = len(students)
    print(f"Starting download and compression for {total} students into: {OUT_DIR}")
    
    results = {
        "downloaded": 0,
        "cached": 0,
        "not_found": 0,
        "error": 0,
        "total_raw_bytes": 0,
        "total_saved_bytes": 0,
    }
    missing_list = []

    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(download_one, s): s for s in students}
        
        for idx, future in enumerate(as_completed(futures), 1):
            res = future.result()
            status = res["status"]
            results[status] += 1
            
            if status in ["downloaded", "cached"]:
                results["total_raw_bytes"] += res.get("raw_bytes", 0)
                results["total_saved_bytes"] += res.get("saved_bytes", 0)
                if status == "downloaded":
                    raw_kb = res["raw_bytes"] / 1024
                    saved_kb = res["saved_bytes"] / 1024
                    if idx % 20 == 0 or idx == total:
                        print(f"[{idx}/{total}] Downloaded {res['fmt_id']} ({res['name']}): {raw_kb:.1f}KB -> {saved_kb:.1f}KB")
            elif status == "not_found":
                missing_list.append(f"{res['fmt_id']} - {res['name']}")
                print(f"[{idx}/{total}] Missing/404 on UMS: {res['fmt_id']} ({res['name']})")
            else:
                print(f"[{idx}/{total}] ERROR on {res['fmt_id']}: {res.get('error')}")

    duration = time.time() - start_time
    print("=" * 60)
    print(f"Completed in {duration:.1f}s")
    print(f"Total students: {total}")
    print(f"Successfully downloaded: {results['downloaded']}")
    print(f"Already cached: {results['cached']}")
    print(f"Photos not found on UMS (404): {results['not_found']}")
    print(f"Errors: {results['error']}")
    if results['total_raw_bytes'] > 0:
        raw_mb = results['total_raw_bytes'] / (1024 * 1024)
        saved_mb = results['total_saved_bytes'] / (1024 * 1024)
        pct = (1.0 - (results['total_saved_bytes'] / results['total_raw_bytes'])) * 100
        print(f"Raw image data: {raw_mb:.2f} MB")
        print(f"Compressed & saved: {saved_mb:.2f} MB (Compression: {pct:.1f}% reduction)")
    print("=" * 60)

if __name__ == "__main__":
    main()
