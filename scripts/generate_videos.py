#!/usr/bin/env python3
"""페르소나 이미지 → 6초 영상 변환 (kie.ai grok-imagine I2V)
이미지를 먼저 0x0.st에 업로드 후 URL로 API 호출
"""

import json
import time
import requests
from pathlib import Path
from PIL import Image
import io

API_KEY = "34d81725bae5f3fcae52a2a5dc98b890"
API_BASE = "https://api.kie.ai/api/v1/jobs"
IMAGES_DIR = Path(__file__).parent.parent / "images"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "videos"

MOTION_PROMPTS = {
    "01_kim_junhyuk": "Gentle subtle movement, slight smile widening, soft hair movement from breeze, warm cafe ambiance, natural blinking",
    "02_lee_seoyeon": "Gentle subtle movement, soft hair flowing slightly, calm peaceful expression, natural blinking, soft light shifts",
    "03_park_minjae": "Gentle subtle movement, slight confident nod, soft breeze through hair, natural blinking, ambient light",
    "04_choi_yujin": "Gentle subtle movement, bright smile with slight head tilt, hair flowing in breeze, natural blinking, warm golden light",
    "05_jung_hayun": "Gentle subtle movement, composed expression with soft smile, minimal movement, natural blinking, soft indoor light",
    "06_han_soojin": "Gentle subtle movement, warm smile deepening, soft hair sway, natural blinking, golden cafe light filtering",
    "07_song_jihoon": "Gentle subtle movement, relaxed expression, soft breeze through hair, natural blinking, outdoor ambient light",
    "08_yoon_minji": "Gentle subtle movement, playful smile, light hair movement, natural blinking, bright airy atmosphere",
    "09_kang_doha": "Gentle subtle movement, thoughtful expression shifting to smile, natural blinking, warm ambient bar light",
    "10_im_nayoung": "Gentle subtle movement, serene calm expression, soft hair sway, natural blinking, diffused window light",
}


def upload_image(image_path: Path) -> str | None:
    """이미지를 리사이즈 후 0x0.st에 업로드, URL 반환"""
    img = Image.open(image_path).convert("RGB")
    # 768px로 리사이즈 (API 10MB 제한)
    max_dim = 768
    ratio = min(max_dim / img.width, max_dim / img.height)
    if ratio < 1:
        img = img.resize((int(img.width * ratio), int(img.height * ratio)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=80)
    buf.seek(0)

    try:
        resp = requests.post(
            "https://catbox.moe/user/api.php",
            data={"reqtype": "fileupload"},
            files={"fileToUpload": (image_path.stem + ".jpg", buf, "image/jpeg")},
            timeout=60
        )
        resp.raise_for_status()
        url = resp.text.strip()
        print(f"  업로드 완료: {url}")
        return url
    except Exception as e:
        print(f"  업로드 실패: {e}")
        return None


def create_video_task(image_url: str, prompt: str) -> str | None:
    """grok-imagine I2V 태스크 생성 (URL 방식)"""
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

    image_files = sorted(IMAGES_DIR.glob("[0-9]*.png"))
    print(f"발견된 이미지: {len(image_files)}장\n")

    for i, img_path in enumerate(image_files, 1):
        stem = img_path.stem
        out = OUTPUT_DIR / f"{stem}.mp4"
        if out.exists():
            print(f"[{i}/{len(image_files)}] {stem} - 이미 존재")
            continue

        prompt = MOTION_PROMPTS.get(stem, "Gentle subtle movement, natural blinking, soft ambient light")
        print(f"[{i}/{len(image_files)}] {stem}")

        # 1. 이미지 업로드
        print(f"  이미지 업로드 중...")
        image_url = upload_image(img_path)
        if not image_url:
            continue

        # 2. 영상 생성 태스크
        print(f"  영상 생성 태스크 생성...")
        task_id = create_video_task(image_url, prompt)
        if not task_id:
            continue
        print(f"  taskId: {task_id}")

        # 3. 결과 대기
        url = wait_result(task_id)
        if url:
            print(f"\n  다운로드 중...")
            download(url, out)
            print(f"  완료: {out.name}\n")
        else:
            print(f"  실패: {stem}\n")


if __name__ == "__main__":
    main()
