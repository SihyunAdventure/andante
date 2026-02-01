# Hero Avatar Video Cards Plan

## 목표
히어로 섹션 하단에 실제 사람 아바타의 6초 영상이 재생되는 카드를 eden.so 스타일로 배치. 아련하고 감성적인 느낌.

## Phase 1: 페르소나 5명 추가 생성 (이미지)
- kie.ai API (`nano-banana-pro` 모델) 사용
- 기존 generate_persona_photos.py의 프롬프트 스타일 참고하여 신규 5명 생성
- 신규 페르소나: 06~10번 (다양한 연령/성별/스타일)
- 출력: `images/06_*.png` ~ `images/10_*.png`

## Phase 2: 10장 이미지 → 영상 변환
- kie.ai API `grok-imagine` 모델 사용 (Image-to-Video)
- 6초, aspect_ratio 2:3 (세로형 유지)
- 프롬프트: 자연스러운 미세 움직임 (머리카락 흩날림, 미소, 눈 깜빡임 등)
- 출력: `public/videos/persona_01.mp4` ~ `public/videos/persona_10.mp4`

## Phase 3: 히어로 하단 카드 UI 구현
- eden.so 레퍼런스 참고: 떠있는 카드들이 비스듬하게 배치
- 각 카드에 `<video autoPlay loop muted playsInline>` 삽입
- 아련한 효과: 카드에 그라데이션 오버레이, 블러, 살짝 투명
- 카드 하단에 이름/나이 텍스트 오버레이
- Framer Motion으로 떠있는 애니메이션 + 스크롤 패럴랙스
- 모바일에서는 가로 스크롤 또는 축소 배치

## Phase 4: 이미지 최적화 & public 배치
- 생성된 이미지를 `public/images/personas/`에 복사 (웹 서빙용)
- 영상은 `public/videos/` 에 배치
- Next.js `<video>` 태그로 서빙

## 파일 변경 목록
- **신규**: `scripts/generate_more_personas.py` (5명 추가 생성)
- **신규**: `scripts/generate_videos.py` (10장 → 영상 변환)
- **수정**: `src/components/landing/HeroSection.tsx` (카드 UI 추가)
- **신규**: `public/videos/` (영상 파일들)
- **신규**: `public/images/personas/` (이미지 파일들)

## 기술 세부사항
- API Key: `34d81725bae5f3fcae52a2a5dc98b890`
- 이미지 모델: `nano-banana-pro`
- 영상 모델: `grok-imagine` (I2V 모드, 6초, 2:3)
- API Base: `https://api.kie.ai/api/v1/jobs`

## 실행 순서
1. Phase 1 → 스크립트 작성 & 실행 (5명 이미지 생성)
2. Phase 2 → 스크립트 작성 & 실행 (10장 영상 변환)
3. Phase 4 → 파일 배치
4. Phase 3 → UI 구현
