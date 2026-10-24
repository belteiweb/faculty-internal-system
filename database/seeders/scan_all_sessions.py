import asyncio
import sys
import os
import json
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')
AUTH_PATH = r"d:\1. Work\Thesis\Bachelor\Batch 6\UMS-System\auth.json"
OUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "all_discovered_sessions.json")

async def scan():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(storage_state=AUTH_PATH)
        page = await context.new_page()
        
        valid = []
        print("Scanning session IDs 1 to 70...")
        for sid in range(1, 71):
            url = f"https://ums.beltei.edu.kh/research-education/thesis/update/{sid}"
            try:
                resp = await page.goto(url, timeout=12000, wait_until="domcontentloaded")
                if resp and resp.status == 200 and "update" in page.url:
                    info = await page.evaluate("""() => {
                        const campEl = document.querySelector('select[name="campus_id"], #campus_id');
                        const camp = campEl && campEl.selectedOptions[0] ? campEl.selectedOptions[0].text.trim() : '';
                        const majEl = document.querySelector('select[name="major_id"], #major_id');
                        const maj = majEl && majEl.selectedOptions[0] ? majEl.selectedOptions[0].text.trim() : '';
                        const shiftEl = document.querySelector('select[name="group_shift_id"], #group_shift_id');
                        const shift = shiftEl && shiftEl.selectedOptions[0] ? shiftEl.selectedOptions[0].text.trim() : '';
                        const batchEl = document.querySelector('input[name="academic_year"], #academic_year');
                        const batch = batchEl ? batchEl.value.trim() : '';
                        return { camp, maj, shift, batch };
                    }""")
                    if info.get("maj"):
                        print(f"Session {sid:2d}: {info['camp']} | {info['maj']} | {info['shift']} | {info['batch']}")
                        valid.append({"session_id": sid, **info})
            except Exception as e:
                pass
                
        print(f"\nTotal valid sessions discovered: {len(valid)}")
        with open(OUT_PATH, "w", encoding="utf-8") as f:
            json.dump(valid, f, ensure_ascii=False, indent=2)
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(scan())
