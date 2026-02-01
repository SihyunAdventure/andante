# Andante MVP 온보딩 플로우 구현 계획

## 컨텍스트

### 원본 요청
Next.js 16 + TypeScript + Tailwind CSS 4 + Framer Motion + Zustand 기반의 Andante MVP 온보딩 플로우 전체 구현.

### 코드베이스 현황
- **프레임워크**: Next.js 16.1.6, React 19, TypeScript 5
- **스타일링**: Tailwind CSS 4 (`@theme inline` 방식), Framer Motion 12
- **상태관리**: Zustand 5 (아직 스토어 없음)
- **폰트**: Instrument Serif (serif headlines) + Pretendard (body)
- **디자인 시스템**: `globals.css`에 정의됨 - cream, rose-dark, pink, yellow 팔레트, gradient-andante, float 애니메이션, noise-overlay
- **기존 구조**: 랜딩 페이지 완성 (HeroSection, ValueProposition, HowItWorks, InviteSection, CTASection + Navbar/Footer)
- **프리셋 아바타**: `public/images/personas/` 에 10개 존재 (01~10)
- **i18n**: next-intl 설치됨 (한국어 기본)
- **Supabase**: 설치됨 (MVP에서는 미사용, localStorage 사용)

---

## 작업 목표

### 핵심 목표
사용자가 12개 음성 질문에 답하고, 성격 분석을 받고, 아바타를 선택/생성하는 온보딩 플로우 구현.

### 산출물
1. `/onboarding` 라우트 (6단계 플로우)
2. 음성 녹음 시스템 (MediaRecorder API)
3. STT API 라우트 (Deepgram Nova-3)
4. 성격 분석 API 라우트 (Claude API)
5. 아바타 생성 API 라우트 (Replicate API)
6. Zustand 온보딩 스토어 + localStorage 영속화
7. 12개 질문 데이터 (한국어)

### 완료 기준
- [ ] `/onboarding` 접속 시 Welcome 화면 표시
- [ ] 12개 질문 순차 녹음 가능
- [ ] 녹음된 음성이 STT로 텍스트 변환됨
- [ ] 성격 분석 결과 표시
- [ ] 사진 업로드 또는 프리셋 선택으로 아바타 설정 가능
- [ ] 모든 데이터 localStorage에 저장
- [ ] 페이지 새로고침 시 진행 상태 유지

---

## 가드레일

### 반드시 포함 (Must Have)
- Andante 디자인 시스템 준수 (cream/rose-dark/pink/yellow 팔레트)
- Framer Motion 페이지 전환 애니메이션
- 모바일 반응형 (모바일 우선)
- 마이크 권한 요청 UX
- 녹음 중 시각적 피드백 (파형 또는 펄스)
- 에러 핸들링 (마이크 거부, API 실패)
- 진행률 표시 (프로그레스 바)

### 절대 하지 않을 것 (Must NOT)
- DB 연동 (Supabase 사용 금지 - MVP)
- 실제 음성 클로닝 구현
- 인증/로그인 플로우
- 기존 랜딩 페이지 수정
- SSR 데이터 패칭 (온보딩은 전부 클라이언트)

---

## Phase 1: 기반 구조 (Foundation)

### Task 1.1: TypeScript 타입 정의
**파일**: `src/types/onboarding.ts`

```typescript
// 정의할 타입들:
- OnboardingStep: 'welcome' | 'questions' | 'analyzing' | 'avatar-choice' | 'avatar-generation' | 'complete'
- VoiceQuestion: { id: number; text: string; category: 'personality' | 'lifestyle' }
- VoiceAnswer: { questionId: number; audioBlob: Blob | null; transcript: string; duration: number }
- PersonalityResult: { traits: Big5Traits; summary: string; keywords: string[] }
- Big5Traits: { openness: number; conscientiousness: number; extraversion: number; agreeableness: number; neuroticism: number }
- AvatarMode: 'upload' | 'preset'
- GeneratedAvatar: { url: string; style: string }
- OnboardingData: { step, currentQuestionIndex, answers, personalityResult, avatarMode, selectedAvatar, uploadedPhoto, generatedAvatars, completedAt }
```

**수락 기준**: 모든 타입이 export되고, 다른 파일에서 import 가능

---

### Task 1.2: 12개 질문 데이터
**파일**: `src/lib/questions.ts`

```typescript
// 12개 질문 (성격 6 + 라이프스타일 6, 섞어서 배치)
// 배치 순서: 가벼운 것부터 → 깊은 것으로

1. (lifestyle) "주말에 주로 뭘 하면서 시간을 보내세요?"
2. (personality) "친한 친구들은 당신을 어떤 사람이라고 말할까요?"
3. (lifestyle) "요즘 가장 빠져 있는 취미나 관심사가 있나요?"
4. (personality) "새로운 사람을 만났을 때 보통 어떤 편이에요?"
5. (lifestyle) "가장 좋아하는 음식이나 맛집이 있다면 알려주세요"
6. (personality) "스트레스를 받으면 주로 어떻게 풀어요?"
7. (lifestyle) "최근에 본 영화, 드라마, 책 중에 인상 깊었던 건?"
8. (personality) "중요한 결정을 내릴 때 어떤 방식으로 하는 편이에요?"
9. (lifestyle) "여행을 간다면 어떤 스타일로 다니는 편이에요?"
10. (personality) "혼자만의 시간과 사람들과 함께하는 시간, 어느 쪽이 더 좋아요?"
11. (lifestyle) "일상에서 가장 소중하게 여기는 루틴이 있나요?"
12. (personality) "5년 후의 자신은 어떤 모습이길 바라세요?"
```

**수락 기준**: `VoiceQuestion[]` 타입으로 export, category 구분 정확

---

### Task 1.3: Zustand 온보딩 스토어
**파일**: `src/stores/onboarding.ts`

```typescript
// 상태:
- step: OnboardingStep
- currentQuestionIndex: number
- answers: VoiceAnswer[]
- personalityResult: PersonalityResult | null
- avatarMode: AvatarMode | null
- selectedAvatar: string | null
- uploadedPhoto: string | null (base64 data URL)
- generatedAvatars: GeneratedAvatar[]
- isRecording: boolean
- isProcessing: boolean

// 액션:
- setStep(step)
- nextQuestion()
- prevQuestion()
- saveAnswer(questionId, audioBlob, transcript, duration)
- setPersonalityResult(result)
- setAvatarMode(mode)
- selectAvatar(url)
- setUploadedPhoto(dataUrl)
- setGeneratedAvatars(avatars)
- setRecording(bool)
- setProcessing(bool)
- resetOnboarding()
- hydrateFromStorage() // localStorage에서 복원

// 미들웨어:
- persist (zustand/middleware) → localStorage key: 'andante-onboarding'
- audioBlob은 persist 제외 (직렬화 불가) → 별도 메모리 Map으로 관리
```

**수락 기준**: 스토어 생성, persist 동작, hydrate 시 step 복원 확인

---

## Phase 2: 온보딩 라우트 및 레이아웃

### Task 2.1: 온보딩 레이아웃
**파일**: `src/app/onboarding/layout.tsx`

```typescript
// - Navbar/Footer 없는 풀스크린 레이아웃
// - cream 배경
// - 상단에 Andante 로고 (작게, 좌측)
// - 상단에 닫기/나가기 버튼 (우측)
// - metadata: title "온보딩 | Andante"
```

**수락 기준**: `/onboarding` 접속 시 Navbar 없이 렌더링

---

### Task 2.2: 온보딩 메인 페이지 (스텝 라우터)
**파일**: `src/app/onboarding/page.tsx`

```typescript
// "use client"
// Zustand 스토어의 step에 따라 컴포넌트 전환
// AnimatePresence로 단계 전환 애니메이션
// 컴포넌트 매핑:
//   'welcome' → <WelcomeStep />
//   'questions' → <QuestionStep />
//   'analyzing' → <AnalyzingStep />
//   'avatar-choice' → <AvatarChoiceStep />
//   'avatar-generation' → <AvatarGenerationStep />
//   'complete' → <CompleteStep />
```

**수락 기준**: step 변경 시 올바른 컴포넌트 렌더링 + 전환 애니메이션

---

## Phase 3: 온보딩 UI 컴포넌트

### Task 3.1: WelcomeStep 컴포넌트
**파일**: `src/components/onboarding/WelcomeStep.tsx`

```
디자인:
- 중앙 정렬, Instrument Serif 헤드라인
- "당신에 대해 알려주세요" 메인 텍스트
- 3가지 안내 아이콘+텍스트:
  1. 🎙️ 12개의 질문에 목소리로 답해주세요
  2. 🧠 AI가 당신의 성격을 분석합니다
  3. 🎨 나만의 아바타를 만들어요
- "시작하기" 버튼 (yellow-300 bg, rose-dark text)
- 소요시간 안내: "약 5-7분 소요"
- Framer Motion: stagger 등장 애니메이션
```

**수락 기준**: 렌더링 확인, 버튼 클릭 시 step → 'questions'

---

### Task 3.2: ProgressBar 공통 컴포넌트
**파일**: `src/components/onboarding/ProgressBar.tsx`

```
- 현재 질문 번호 / 전체 12개 표시
- 가로 프로그레스 바 (pink-400 fill, warm-200 bg)
- "3 / 12" 텍스트 표시
- Framer Motion: 바 너비 애니메이션
- QuestionStep 상단에 배치
```

**수락 기준**: currentQuestionIndex에 따라 진행률 정확히 표시

---

### Task 3.3: VoiceRecorder 컴포넌트
**파일**: `src/components/onboarding/VoiceRecorder.tsx`

```
핵심 기능:
- MediaRecorder API로 녹음 (audio/webm)
- 녹음 시작/중지 토글 버튼 (큰 원형)
- 녹음 중: 펄스 애니메이션 (pink-400 glow)
- 녹음 시간 표시 (00:00 형식)
- 최소 3초 / 최대 60초 제한
- 녹음 완료 후: 재생/다시녹음 옵션
- 마이크 권한 거부 시 안내 메시지

상태:
- idle → recording → recorded
- idle: 탭하여 녹음 시작
- recording: 탭하여 녹음 중지
- recorded: 재생, 다시녹음, 다음으로

콜백:
- onRecordingComplete(blob: Blob, duration: number)
```

**수락 기준**: Chrome/Safari에서 녹음-재생 동작 확인

---

### Task 3.4: QuestionStep 컴포넌트
**파일**: `src/components/onboarding/QuestionStep.tsx`

```
구성:
- 상단: ProgressBar
- 중앙: 질문 텍스트 (Instrument Serif, 큰 글씨)
- 질문 카테고리 뱃지 ("성격" / "일상")
- 하단: VoiceRecorder
- 녹음 완료 시: "다음" 버튼 활성화
- AnimatePresence로 질문 전환 (좌→우 슬라이드)
- "이전" 버튼 (첫 질문 제외)

플로우:
1. 질문 표시
2. 사용자 녹음
3. 녹음 완료 → STT API 호출 (백그라운드)
4. "다음" 클릭 → 다음 질문
5. 12번째 질문 완료 → step → 'analyzing'

STT 호출:
- 녹음 완료 시 즉시 /api/stt로 POST
- transcript를 answer에 저장
- STT 실패해도 다음 진행 가능 (transcript 빈 문자열)
```

**수락 기준**: 12개 질문 순차 진행, 답변 저장, 질문 전환 애니메이션

---

### Task 3.5: AnalyzingStep 컴포넌트
**파일**: `src/components/onboarding/AnalyzingStep.tsx`

```
디자인:
- 로딩 애니메이션 (floating blobs + 텍스트)
- "당신의 성격을 분석하고 있어요..." 메시지
- 단계별 메시지 전환 (2초 간격):
  1. "답변을 분석하고 있어요..."
  2. "성격 패턴을 찾고 있어요..."
  3. "거의 다 됐어요..."
- 원형 프로그레스 또는 추상적 파티클 애니메이션

로직:
- mount 시 /api/personality POST (모든 transcript 전송)
- 응답 받으면 personalityResult 저장
- 최소 4초 대기 (UX) 후 step → 'avatar-choice'
- API 실패 시: 기본 성격 결과 사용 + 에러 toast
```

**수락 기준**: API 호출 + 최소 대기시간 후 자동 전환

---

### Task 3.6: AvatarChoiceStep 컴포넌트
**파일**: `src/components/onboarding/AvatarChoiceStep.tsx`

```
두 가지 모드 선택 카드:
1. "사진으로 아바타 만들기" - 카메라 아이콘
   - 내 사진을 업로드하면 AI가 스타일링
   - pink gradient 카드
2. "프리셋 아바타 고르기" - 팔레트 아이콘
   - 미리 만들어진 아바타 중 선택
   - yellow gradient 카드

카드 클릭:
- "사진으로" → avatarMode 'upload' → 사진 업로드 UI 표시
- "프리셋" → avatarMode 'preset' → 프리셋 그리드 표시

사진 업로드 UI:
- <input type="file" accept="image/*"> (hidden)
- 드래그앤드롭 또는 클릭 업로드
- 미리보기 표시
- "아바타 생성하기" 버튼 → /api/avatar POST → step → 'avatar-generation'

프리셋 선택 UI:
- 10개 프리셋 그리드 (2x5 또는 스크롤)
- public/images/personas/ 이미지 사용
- 선택 시 border highlight (pink-400)
- "이 아바타로 할래요" 버튼 → step → 'complete'
```

**수락 기준**: 두 모드 모두 동작, 사진 업로드 미리보기, 프리셋 선택

---

### Task 3.7: AvatarGenerationStep 컴포넌트
**파일**: `src/components/onboarding/AvatarGenerationStep.tsx`

```
- 업로드 사진 기반 아바타 생성 결과 대기
- 로딩 중: "아바타를 만들고 있어요..." + 애니메이션
- 생성 완료: 3개 스타일 옵션 표시 (카드 형태)
  - 각 카드: 생성된 이미지 + 스타일 이름
- 하나 선택 → selectedAvatar 저장 → step → 'complete'
- 생성 실패 시: "다시 시도" 또는 "프리셋으로 선택" 폴백
```

**수락 기준**: 3개 생성 결과 표시, 선택 후 complete 전환

---

### Task 3.8: CompleteStep 컴포넌트
**파일**: `src/components/onboarding/CompleteStep.tsx`

```
디자인:
- 축하 애니메이션 (confetti 또는 부드러운 파티클)
- 선택된 아바타 크게 표시
- 성격 분석 요약:
  - Big5 각 항목 바 차트 (horizontal bar)
  - 한줄 요약 텍스트
  - 키워드 태그 (#외향적 #창의적 등)
- "Andante 시작하기" CTA 버튼
- (MVP에서는 홈으로 돌아가기)

구현:
- Framer Motion stagger 등장
- 바 차트: motion.div width 애니메이션
- localStorage에 completedAt 저장
```

**수락 기준**: 아바타 + 성격 결과 표시, CTA 동작

---

## Phase 4: API 라우트

### Task 4.1: STT API 라우트 (Deepgram)
**파일**: `src/app/api/stt/route.ts`

```typescript
// POST: FormData with audio file
// 1. FormData에서 audio blob 추출
// 2. Deepgram Nova-3 API 호출
//    - URL: https://api.deepgram.com/v1/listen
//    - Headers: Authorization: Token {DEEPGRAM_API_KEY}
//    - Query params: model=nova-3, language=ko, smart_format=true
//    - Body: audio binary
// 3. 응답에서 transcript 추출
// 4. { transcript: string } 반환

// 환경변수: DEEPGRAM_API_KEY
// 에러 핸들링: API 실패 시 { transcript: "", error: string }
```

**수락 기준**: 한국어 음성 → 텍스트 변환 동작 확인

---

### Task 4.2: 성격 분석 API 라우트 (Claude)
**파일**: `src/app/api/personality/route.ts`

```typescript
// POST: { answers: { questionId: number, transcript: string }[] }
// 1. Claude API 호출 (Anthropic SDK)
//    - 시스템 프롬프트: Big Five 성격 분석가 역할
//    - 12개 답변 텍스트 전달
//    - JSON 형식 응답 요청:
//      { traits: { openness, conscientiousness, extraversion, agreeableness, neuroticism },
//        summary: "한줄 요약",
//        keywords: ["키워드1", "키워드2", ...] }
//    - 각 trait: 0~100 숫자
// 2. 파싱 후 반환

// 환경변수: ANTHROPIC_API_KEY
// 에러 핸들링: 파싱 실패 시 기본값 반환
// 추가 설치: @anthropic-ai/sdk
```

**수락 기준**: transcript 배열 → Big5 분석 결과 반환

---

### Task 4.3: 아바타 생성 API 라우트 (Replicate)
**파일**: `src/app/api/avatar/route.ts`

```typescript
// POST: FormData with photo file
// 1. 이미지를 base64로 변환
// 2. Replicate API 호출 (3회, 다른 스타일 프롬프트)
//    - 모델: stability-ai/sdxl + ip-adapter
//    - 또는 대안: tencentarc/photomaker
//    - 스타일 프롬프트:
//      a. "anime style portrait, soft pastel colors"
//      b. "watercolor illustration portrait, warm tones"
//      c. "digital art portrait, minimalist flat design"
// 3. 3개 결과 URL 반환
//    { avatars: [{ url, style }] }

// 환경변수: REPLICATE_API_TOKEN
// 에러 핸들링: 생성 실패 시 빈 배열 + 에러 메시지
// 추가 설치: replicate
```

**수락 기준**: 사진 업로드 → 3개 스타일 아바타 생성

---

## Phase 5: 통합 및 마무리

### Task 5.1: 환경변수 설정
**파일**: `.env.local.example`

```
DEEPGRAM_API_KEY=
ANTHROPIC_API_KEY=
REPLICATE_API_TOKEN=
```

**수락 기준**: example 파일 생성, .gitignore에 .env.local 확인

---

### Task 5.2: 패키지 설치
```bash
npm install @anthropic-ai/sdk replicate
```

**수락 기준**: 빌드 에러 없음

---

### Task 5.3: 통합 테스트 및 플로우 검증
```
수동 테스트 체크리스트:
- [ ] / → "시작하기" 버튼 → /onboarding 이동
- [ ] Welcome → "시작하기" → 첫 질문
- [ ] 마이크 권한 요청 팝업
- [ ] 12개 질문 순차 녹음 + 이전/다음
- [ ] 프로그레스 바 정확한 진행률
- [ ] 분석 로딩 화면 → 결과
- [ ] 아바타 모드 선택 (사진/프리셋)
- [ ] 프리셋 선택 → Complete
- [ ] 사진 업로드 → 생성 → 선택 → Complete
- [ ] Complete 화면: 아바타 + Big5 + 키워드
- [ ] 새로고침 시 진행 상태 유지
- [ ] 모바일 뷰포트 레이아웃
```

---

## 태스크 의존성

```
Phase 1 (병렬 가능):
  Task 1.1 (types) ──┐
  Task 1.2 (questions)├── Phase 2 (순차)
  Task 1.3 (store) ──┘     │
                            ├── Task 2.1 (layout)
                            └── Task 2.2 (page) ── Phase 3 (부분 병렬)
                                                      │
                                    ┌─────────────────┤
                                    │                  │
                              Task 3.1 (Welcome)  Task 3.2 (ProgressBar)
                              Task 3.3 (VoiceRecorder) ── Task 3.4 (QuestionStep)
                              Task 3.5 (Analyzing)
                              Task 3.6 (AvatarChoice)
                              Task 3.7 (AvatarGeneration)
                              Task 3.8 (Complete)
                                    │
                                    └── Phase 4 (병렬 가능)
                                          ├── Task 4.1 (STT API)
                                          ├── Task 4.2 (Personality API)
                                          └── Task 4.3 (Avatar API)
                                                │
                                                └── Phase 5 (통합)
```

---

## 커밋 전략

| 커밋 | 내용 |
|------|------|
| 1 | `feat(onboarding): add types, questions data, and zustand store` |
| 2 | `feat(onboarding): add route layout and step router page` |
| 3 | `feat(onboarding): add WelcomeStep and ProgressBar components` |
| 4 | `feat(onboarding): add VoiceRecorder and QuestionStep components` |
| 5 | `feat(onboarding): add AnalyzingStep and API routes (STT, personality)` |
| 6 | `feat(onboarding): add AvatarChoiceStep, AvatarGenerationStep, and avatar API` |
| 7 | `feat(onboarding): add CompleteStep and integration polish` |

---

## 성공 기준

1. **기능 완성**: 온보딩 전체 플로우가 시작부터 끝까지 동작
2. **디자인 일관성**: 기존 랜딩 페이지와 동일한 디자인 시스템 사용
3. **에러 처리**: 마이크 거부, API 실패 등 예외 상황 대응
4. **반응형**: 모바일/데스크톱 모두 사용 가능
5. **UX**: 부드러운 전환 애니메이션, 직관적인 녹음 UI
6. **데이터 보존**: localStorage로 진행 상태 및 결과 영속화
