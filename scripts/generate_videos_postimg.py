#!/usr/bin/env python3
"""페르소나 이미지 → 6초 영상 변환 (postimg URL → grok-imagine I2V)"""

import json
import time
import requests
from pathlib import Path

API_KEY = "34d81725bae5f3fcae52a2a5dc98b890"
API_BASE = "https://api.kie.ai/api/v1/jobs"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "videos"

PERSONAS = [
    {"id": "01_kim_junhyuk", "url": "https://i.postimg.cc/rD41Q8ML/01-kim-junhyuk.png",
     "prompt": "Gentle subtle movement, slight smile widening, soft hair movement from breeze, warm cafe ambiance, natural blinking"},
    {"id": "02_lee_seoyeon", "url": "https://i.postimg.cc/zbzTzKh2/02-lee-seoyeon.png",
     "prompt": "Gentle subtle movement, soft hair flowing slightly, calm peaceful expression, natural blinking, soft light shifts"},
    {"id": "03_park_minjae", "url": "https://i.postimg.cc/sQT7vx9f/03-park-minjae.png",
     "prompt": "Gentle subtle movement, slight confident nod, soft breeze through hair, natural blinking, ambient light"},
    {"id": "04_choi_yujin", "url": "https://i.postimg.cc/y3W99Kvt/04-choi-yujin.png",
     "prompt": "Gentle subtle movement, bright smile with slight head tilt, hair flowing in breeze, natural blinking, warm golden light"},
    {"id": "05_jung_hayun", "url": "https://i.postimg.cc/gLrRRpN8/05-jung-hayun.png",
     "prompt": "Gentle subtle movement, composed expression with soft smile, minimal movement, natural blinking, soft indoor light"},
    {"id": "06_han_soojin", "url": "https://i.postimg.cc/8j2WFqWd/06-han-soojin.png",
     "prompt": "Gentle subtle movement, warm smile deepening, soft hair sway, natural blinking, golden cafe light filtering"},
    {"id": "07_song_jihoon", "url": "https://i.postimg.cc/jLpNWGNX/07-song-jihoon.png",
     "prompt": "Gentle subtle movement, relaxed expression, soft breeze through hair, natural blinking, outdoor ambient light"},
    {"id": "08_yoon_minji", "url": "https://i.postimg.cc/nCy7s671/08-yoon-minji.png",
     "prompt": "Gentle subtle movement, playful smile, light hair movement, natural blinking, bright airy atmosphere"},
    {"id": "09_kang_doha", "url": "https://i.postimg.cc/RNkf3jfd/09-kang-doha.png",
     "prompt": "Gentle subtle movement, thoughtful expression shifting to smile, natural blinking, warm ambient bar light"},
    {"id": "10_im_nayoung", "url": "https://i.postimg.cc/Wd0Z0X68/10-im-nayoung.png",
     "prompt": "Gentle subtle movement, serene calm expression, soft hair sway, natural blinking, diffused window light"},
]


def create_video_task(image_url: str, prompt: str) -> str | None:
    resp = requests.post(
        f"{API_BASE}/createTask",
        headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
        json={
            "model": "grok-imagine/image-to-video",
            "input": {
                "prompt": prompt,
                "image_urls": [image_url],
                "mode": "normal",
                "duration": "6",
            }
        },
        timeout=60
    )
    resp.raise_for_status()
    result = resp.json()
    if result.get("code") == 200 and result.get("data", {}).get("taskId"):
        return result["data"]["taskId"]
    print(f"  오류: {result.get('msg', 'unknown')}")
    return None


def wait_result(task_id: str, max_wait: int = 600) -> str | None:
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
            print(f"\n  실패: {data.get('failMsg', 'unknown')}")
            return None
        elapsed = int(time.time() - start)
        print(f"  대기 중... ({state}, {elapsed}s)", end="\r", flush=True)
        time.sleep(5)
    print(f"\n  타임아웃 ({max_wait}s)")
    return None


def download(url: str, path: Path):
    resp = requests.get(url, timeout=120)
    resp.raise_for_status()
    path.write_bytes(resp.content)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"총 {len(PERSONAS)}개 영상 생성\n")

    for i, p in enumerate(PERSONAS, 1):
        out = OUTPUT_DIR / f"{p['id']}.mp4"
        if out.exists():
            print(f"[{i}/{len(PERSONAS)}] {p['id']} - 이미 존재")
            continue

        print(f"[{i}/{len(PERSONAS)}] {p['id']}")
        print(f"  URL: {p['url']}")

        task_id = create_video_task(p["url"], p["prompt"])
        if not task_id:
            continue
        print(f"  taskId: {task_id}")

        url = wait_result(task_id)
        if url:
            print(f"\n  다운로드 중...")
            download(url, out)
            print(f"  완료: {out.name}\n")
        else:
            print(f"  실패: {p['id']}\n")


if __name__ == "__main__":
    main()
