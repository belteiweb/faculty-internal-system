import asyncio
import sys
import os
import json
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')
AUTH_PATH = r"d:\1. Work\Thesis\Bachelor\Batch 6\UMS-System\auth.json"

async def check_range():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(storage_state=AUTH_PATH)
        page = await context.new_page()
        
        found = []
        # Check sessions 91 to 110
        test_ids = list(range(91, 111))
        for sid in test_ids:
            url = f"https://ums.beltei.edu.kh/research-education/thesis/update/{sid}"
            try:
                resp = await page.goto(url, timeout=8000, wait_until="domcontentloaded")
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
                        print(f"Session {sid:2d}: {info['camp']} | {info['maj']} | Shift: {info['shift']} | Batch: {info['batch']}", flush=True)
                        found.append({"session_id": sid, **info})
            except Exception as e:
                pass
                
        print(f"\nDiscovered {len(found)} sessions in tested range.", flush=True)
        with open("database/seeders/campus2_sessions_discovered.json", "w", encoding="utf-8") as f:
            json.dump(found, f, ensure_ascii=False, indent=2)
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(check_range())
