#!/usr/bin/env python3
"""추가 페르소나 5명 이미지 생성 (kie.ai nano-banana-pro)"""

import json
import time
import requests
from pathlib import Path

API_KEY = "34d81725bae5f3fcae52a2a5dc98b890"
API_BASE = "https://api.kie.ai/api/v1/jobs"
OUTPUT_DIR = Path(__file__).parent.parent / "images"

PERSONAS = [
    {
        "id": "06_han_soojin",
        "name": "한수진",
        "prompt": """Candid portrait photo of a Korean woman, 26 years old,
warm genuine smile, soft dreamy expression,
shoulder-length layered hair with subtle highlights,
wearing oversized cream cardigan over white top,
soft golden hour lighting filtering through window,
shot on iPhone 16 Pro Max, portrait mode with natural bokeh,
blurred cozy cafe interior with warm pendant lights,
authentic casual photo style, taken by a friend,
natural skin texture with visible pores, slight film grain,
warm soft color tones, realistic photo quality"""
    },
    {
        "id": "07_song_jihoon",
        "name": "송지훈",
        "prompt": """Candid portrait photo of a Korean man, 28 years old,
relaxed confident smile, warm friendly eyes,
modern textured hairstyle swept to the side,
wearing casual olive green jacket over white tee,
natural outdoor lighting, soft overcast day,
shot on Samsung Galaxy S25 Ultra, portrait mode,
blurred park with autumn trees in background,
authentic casual photo style, taken by a friend,
natural skin texture with visible pores, subtle film grain,
natural warm color tones, realistic photo quality"""
    },
    {
        "id": "08_yoon_minji",
        "name": "윤민지",
        "prompt": """Candid portrait photo of a Korean woman, 30 years old,
bright playful smile, sparkling expressive eyes,
long wavy dark brown hair, natural fresh makeup,
wearing simple white linen blouse with delicate necklace,
soft natural light from a large window, bright airy room,
shot on iPhone 16 Pro, portrait mode with bokeh,
blurred minimalist white interior background,
authentic casual photo style, taken by a friend,
natural skin texture with visible pores, film grain effect,
bright clean color tones, realistic photo quality"""
    },
    {
        "id": "09_kang_doha",
        "name": "강도하",
        "prompt": """Candid portrait photo of a Korean man, 33 years old,
gentle thoughtful expression, slight warm smile,
neat short hairstyle, light stubble,
wearing casual charcoal crew neck sweater,
soft evening ambient lighting, warm indoor setting,
shot on iPhone 16 Pro Max, portrait mode with natural bokeh,
blurred wine bar interior with soft warm lights,
authentic casual photo style, taken by a friend,
natural skin texture with visible pores, subtle film grain,
moody warm color tones, realistic photo quality"""
    },
    {
        "id": "10_im_nayoung",
        "name": "임나영",
        "prompt": """Candid portrait photo of a Korean woman, 25 years old,
soft serene smile, gentle calm expression,
straight dark hair with curtain bangs, minimal natural makeup,
wearing cozy beige turtleneck sweater,
soft diffused natural light, cloudy day by window,
shot on Samsung Galaxy S25 Ultra, portrait mode,
blurred bookstore interior with warm wooden shelves,
authentic casual photo style, taken by a friend,
natural skin texture with visible pores, subtle film grain,
soft muted warm color tones, realistic photo quality"""
    }
]


def create_task(prompt):
    resp = requests.post(
        f"{API_BASE}/createTask",
        headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
        json={"model": "nano-banana-pro", "input": {"prompt": prompt, "output_format": "png", "aspect_ratio": "3:4", "resolution": "2K"}},
        timeout=30
    )
    resp.raise_for_status()
    result = resp.json()
    if result.get("code") == 200 and result.get("data", {}).get("taskId"):
        return result["data"]["taskId"]
    print(f"  오류: {result.get('msg', 'unknown')}")
    return None


def wait_result(task_id, max_wait=180):
    start = time.time()
    while time.time() - start < max_wait:
        resp = requests.get(
            f"{API_BASE}/recordInfo?taskId={task_id}",
            headers={"Authorization": f"Bearer {API_KEY}"},
            timeout=30
        )
        data = resp.json().get("data", {})
        state = data.get("state")
        if state == "success":
            result_json = json.loads(data.get("resultJson", "{}"))
            urls = result_json.get("resultUrls", [])
            return urls[0] if urls else None
        elif state == "fail":
            print(f"  실패: {data.get('failMsg', 'unknown')}")
            return None
        elapsed = int(time.time() - start)
        print(f"  대기 중... ({state}, {elapsed}s)", end="\r", flush=True)
        time.sleep(3)
    print(f"\n  타임아웃 ({max_wait}s)")
    return None


def download(url, path):
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    path.write_bytes(resp.content)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for i, p in enumerate(PERSONAS, 1):
        out = OUTPUT_DIR / f"{p['id']}.png"
        if out.exists():
            print(f"[{i}/5] {p['name']} - 이미 존재")
            continue
        print(f"[{i}/5] {p['name']} 생성 중...")
        task_id = create_task(p["prompt"])
        if not task_id:
            continue
        print(f"  taskId: {task_id}")
        url = wait_result(task_id)
        if url:
            download(url, out)
            print(f"  완료: {out.name}")
        else:
            print(f"  실패: {p['name']}")


if __name__ == "__main__":
    main()
