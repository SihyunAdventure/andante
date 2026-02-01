#!/usr/bin/env python3
"""
페르소나 프로필 사진 생성 스크립트
kie.ai Nano Banana Pro API를 사용하여 5명의 가상 인물 사진 생성
"""

import os
import sys
import time
import requests
from pathlib import Path
from datetime import date
from dotenv import load_dotenv

# 프로젝트 루트의 .env 파일 로드
PROJECT_ROOT = Path(__file__).parent.parent.parent
load_dotenv(PROJECT_ROOT / ".env")

# kie.ai API 설정
KIE_API_KEY = os.getenv("KIE_API_KEY")
KIE_API_BASE = "https://api.kie.ai/api/v1/jobs"
KIE_CREATE_TASK_URL = f"{KIE_API_BASE}/createTask"
KIE_RECORD_INFO_URL = f"{KIE_API_BASE}/recordInfo"

# 출력 디렉토리
TODAY = date.today().strftime("%Y-%m-%d")
OUTPUT_DIR = Path(__file__).parent.parent.parent / "output" / TODAY / "artifacts" / "personas"

# 페르소나별 프롬프트 정의 - 자연스러운 캐주얼 스타일
PERSONAS = [
    {
        "id": "01_kim_junhyuk",
        "name": "김준혁",
        "prompt": """Candid portrait photo of a Korean man, 32 years old, friendly warm smile,
bright energetic expression, slightly messy modern hairstyle,
wearing casual hoodie and t-shirt,
natural outdoor lighting, golden hour sunlight,
shot on iPhone 16 Pro Max, portrait mode with natural bokeh,
blurred cafe background with warm ambient lights,
authentic casual selfie style, taken by a friend,
natural skin texture with pores visible, slight film grain,
warm color tones, realistic imperfect photo quality"""
    },
    {
        "id": "02_lee_seoyeon",
        "name": "이서연",
        "prompt": """Candid portrait photo of a Korean woman, 29 years old,
gentle calm expression, soft subtle smile,
elegant natural look, minimal makeup, dewy skin,
long straight dark hair, wearing cozy cream knit sweater,
soft natural window light from the side,
shot on Samsung Galaxy S25 Ultra, portrait mode,
blurred bookshelf and plants in background,
authentic casual photo style, taken by a friend,
natural skin texture with visible pores, subtle film grain,
soft warm color tones, realistic photo quality"""
    },
    {
        "id": "03_park_minjae",
        "name": "박민재",
        "prompt": """Candid portrait photo of a Korean man, 35 years old,
composed confident expression, slight gentle smile,
neat short hairstyle, clean-shaven,
wearing casual navy button-up shirt, top button open,
natural outdoor lighting, overcast soft light,
shot on iPhone 16 Pro, portrait mode with bokeh,
blurred urban street background with trees,
authentic casual photo style, taken by a friend,
natural skin texture with visible pores, subtle film grain,
neutral color tones, realistic photo quality"""
    },
    {
        "id": "04_choi_yujin",
        "name": "최유진",
        "prompt": """Candid portrait photo of a Korean woman, 27 years old,
bright confident smile, energetic vibrant expression,
trendy modern hairstyle with slight waves, natural glowing makeup,
wearing stylish casual outfit, small hoop earrings,
natural golden hour outdoor lighting,
shot on Samsung Galaxy S25 Ultra, portrait mode,
blurred colorful street background with neon signs,
authentic casual selfie style, fun candid moment,
natural skin texture with visible pores, film grain effect,
vibrant warm color tones, realistic photo quality"""
    },
    {
        "id": "05_jung_hayun",
        "name": "정하윤",
        "prompt": """Candid portrait photo of a Korean woman, 31 years old,
composed intellectual expression, confident subtle smile,
sleek professional hairstyle, minimal natural makeup,
wearing casual black turtleneck sweater,
soft natural indoor lighting from large window,
shot on iPhone 16 Pro Max, portrait mode with bokeh,
blurred modern minimalist interior background,
authentic casual photo style, taken by a colleague,
natural skin texture with visible pores, subtle film grain,
cool neutral color tones, realistic photo quality"""
    }
]


def create_task(prompt: str) -> str | None:
    """
    이미지 생성 태스크 생성

    Args:
        prompt: 이미지 생성 프롬프트

    Returns:
        taskId 또는 None
    """
    headers = {
        "Authorization": f"Bearer {KIE_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "nano-banana-pro",
        "input": {
            "prompt": prompt,
            "output_format": "png",
            "aspect_ratio": "3:4",  # 증명사진 비율
            "resolution": "2K"
        }
    }

    try:
        response = requests.post(KIE_CREATE_TASK_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()

        if result.get("code") == 200 and result.get("data", {}).get("taskId"):
            return result["data"]["taskId"]
        else:
            print(f"  오류: {result.get('msg', '알 수 없는 오류')}")
            return None

    except requests.exceptions.HTTPError as e:
        print(f"  오류: HTTP {e.response.status_code} - {e.response.text}")
        return None
    except Exception as e:
        print(f"  오류: {e}")
        return None


def get_task_result(task_id: str, max_wait: int = 120) -> str | None:
    """
    태스크 완료 대기 및 결과 URL 반환

    Args:
        task_id: 태스크 ID
        max_wait: 최대 대기 시간(초)

    Returns:
        이미지 URL 또는 None
    """
    import json as json_module

    headers = {
        "Authorization": f"Bearer {KIE_API_KEY}"
    }

    start_time = time.time()

    while time.time() - start_time < max_wait:
        try:
            # GET 요청으로 상태 확인
            response = requests.get(
                f"{KIE_RECORD_INFO_URL}?taskId={task_id}",
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            result = response.json()

            if result.get("code") == 200:
                data = result.get("data", {})
                state = data.get("state")

                if state == "success":
                    # resultJson에서 이미지 URL 추출
                    result_json_str = data.get("resultJson", "{}")
                    try:
                        result_json = json_module.loads(result_json_str)
                        urls = result_json.get("resultUrls", [])
                        if urls:
                            return urls[0]
                    except json_module.JSONDecodeError:
                        pass

                    print(f"  경고: 이미지 URL을 찾을 수 없음")
                    return None

                elif state == "fail":
                    fail_msg = data.get("failMsg", "알 수 없는 오류")
                    print(f"  오류: 생성 실패 - {fail_msg}")
                    return None

                elif state in ["pending", "processing", "running"]:
                    elapsed = int(time.time() - start_time)
                    print(f"  대기 중... ({state}, {elapsed}초)", end="\r")
                    time.sleep(2)
                    continue

            time.sleep(2)

        except Exception as e:
            print(f"  오류: {e}")
            time.sleep(2)

    print(f"\n  오류: 시간 초과 ({max_wait}초)")
    return None


def download_image(url: str, output_path: Path) -> bool:
    """
    이미지 다운로드

    Args:
        url: 이미지 URL
        output_path: 저장 경로

    Returns:
        성공 여부
    """
    try:
        response = requests.get(url, timeout=60)
        response.raise_for_status()

        with open(output_path, "wb") as f:
            f.write(response.content)
        return True

    except Exception as e:
        print(f"  다운로드 오류: {e}")
        return False


def generate_image(prompt: str, output_path: Path) -> bool:
    """
    kie.ai API를 사용하여 이미지 생성

    Args:
        prompt: 이미지 생성 프롬프트
        output_path: 저장할 파일 경로

    Returns:
        성공 여부
    """
    if not KIE_API_KEY:
        print("오류: KIE_API_KEY가 설정되지 않았습니다.")
        return False

    # 1. 태스크 생성
    print(f"  태스크 생성 중...")
    task_id = create_task(prompt)
    if not task_id:
        return False

    print(f"  태스크 ID: {task_id}")

    # 2. 결과 대기
    print(f"  이미지 생성 대기 중...")
    image_url = get_task_result(task_id)
    if not image_url:
        return False

    # 3. 이미지 다운로드
    print(f"  다운로드 중...")
    return download_image(image_url, output_path)


def main():
    """메인 실행 함수"""
    print("=" * 60)
    print("페르소나 프로필 사진 생성")
    print(f"모델: Nano Banana Pro (Gemini 3 Pro Image)")
    print(f"출력 디렉토리: {OUTPUT_DIR}")
    print("=" * 60)

    # API 키 확인
    if not KIE_API_KEY:
        print("\n오류: KIE_API_KEY 환경변수가 설정되지 않았습니다.")
        print("다음 중 하나의 방법으로 설정해주세요:")
        print("  1. .env 파일에 KIE_API_KEY=your_key 추가")
        print("  2. export KIE_API_KEY=your_key 실행")
        sys.exit(1)

    # 출력 디렉토리 생성
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"\n출력 디렉토리: {OUTPUT_DIR}")

    # 각 페르소나별 이미지 생성
    success_count = 0
    for i, persona in enumerate(PERSONAS, 1):
        print(f"\n[{i}/5] {persona['name']} ({persona['id']})")

        output_path = OUTPUT_DIR / f"{persona['id']}.png"

        if output_path.exists():
            print(f"  이미 존재함: {output_path.name}")
            success_count += 1
            continue

        if generate_image(persona["prompt"], output_path):
            print(f"  완료: {output_path.name}")
            success_count += 1
        else:
            print(f"  실패: {persona['name']}")

    # 결과 요약
    print("\n" + "=" * 60)
    print(f"완료: {success_count}/5 이미지 생성됨")
    print(f"저장 위치: {OUTPUT_DIR}")
    print("=" * 60)

    return success_count == 5


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
