# 온보딩 풀 플로우 구현 계획

## 요약
Clerk 인증 → 12개 음성 질문 답변 → Convex 저장 → 성격 분석 → 캐릭터 생성(성격+아바타+대화스타일+보이스+자기소개) 전체 파이프라인 구현

## 기술 스택
- **Auth**: Clerk (Google 로그인만)
- **DB + File Storage**: Convex (음성 파일도 Convex Storage 사용, MVP 1GB 충분)
- **AI 모델**: DeepSeek v3.2 (성격분석 + 대화 + 자기소개 생성)
- **STT**: Deepgram Nova-3
- **Voice Clone**: Supertone
- **TTS**: Supertone (클론된 목소리로 자기소개 음성 생성)

---

## Phase 1: Clerk + Convex 셋업

### 1-1. 패키지 설치
```bash
npm install convex @clerk/nextjs
npx convex init
# Supabase 패키지 제거
npm uninstall @supabase/ssr @supabase/supabase-js
```

### 1-2. Clerk 설정
- Clerk 대시보드에서 Google OAuth 설정
- Clerk 대시보드 → JWT Templates → "Convex" 템플릿 생성
- `.env.local`:
  ```
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
  CLERK_SECRET_KEY=sk_...
  NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
  ```

### 1-3. Provider 설정
- `src/app/ConvexClientProvider.tsx` — ClerkProvider + ConvexProviderWithClerk 래핑
- `src/app/layout.tsx` — ConvexClientProvider 적용
- `middleware.ts` — Clerk 미들웨어 (publicRoutes: `/`, `/api/webhook`)

### 1-4. 인증 플로우
- 랜딩 페이지 → "시작하기" → Clerk 로그인 모달 (Google)
- 첫 가입 → `/onboarding` 리다이렉트
- 온보딩 완료 유저 → `/dashboard` 리다이렉트

---

## Phase 2: Convex 스키마 + 함수

### 2-1. 스키마 (`convex/schema.ts`)
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  voiceAnswers: defineTable({
    userId: v.id("users"),
    questionId: v.string(),             // q1~q12
    audioStorageId: v.id("_storage"),   // Convex file storage
    transcript: v.optional(v.string()),
    durationSeconds: v.optional(v.float64()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  personalityResults: defineTable({
    userId: v.id("users"),
    communicationDirectness: v.float64(),  // 0~100
    socialEnergy: v.float64(),
    emotionalExpression: v.float64(),
    lifeApproach: v.float64(),
    rationale: v.object({
      communicationDirectness: v.string(),
      socialEnergy: v.string(),
      emotionalExpression: v.string(),
      lifeApproach: v.string(),
    }),
    summary: v.string(),
    confidence: v.float64(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  characters: defineTable({
    userId: v.id("users"),
    avatarStorageId: v.optional(v.id("_storage")),
    avatarMode: v.string(),               // 'upload' | 'preset'
    presetAvatarId: v.optional(v.string()),
    voiceId: v.optional(v.string()),       // Supertone voice ID
    introText: v.optional(v.string()),     // AI 생성 자기소개
    introAudioStorageId: v.optional(v.id("_storage")), // TTS 음성
    systemPrompt: v.optional(v.string()),  // AI 대화용 프롬프트
    speechStyle: v.optional(v.object({
      tone: v.string(),
      emojiFrequency: v.string(),
      sentenceLength: v.string(),
      humor: v.string(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
```

### 2-2. Convex 함수들

**Mutations (DB 쓰기):**
- `convex/users.ts` — `createUser`, `markOnboardingComplete`
- `convex/voiceAnswers.ts` — `saveAnswer`, `getAnswersByUser`
- `convex/personalityResults.ts` — `saveResult`, `getByUser`
- `convex/characters.ts` — `createCharacter`, `updateCharacter`, `getByUser`

**Actions (외부 API 호출):**
- `convex/actions/stt.ts` — Deepgram STT 호출
- `convex/actions/personality.ts` — DeepSeek v3.2 성격 분석
- `convex/actions/voiceClone.ts` — Supertone 보이스 클론
- `convex/actions/characterGen.ts` — DeepSeek v3.2 캐릭터 생성
- `convex/actions/tts.ts` — Supertone TTS → Convex Storage 저장

**Queries (읽기):**
- `convex/users.ts` — `getByClerkId`
- `convex/characters.ts` — `getByUser`

---

## Phase 3: 온보딩 플로우 수정

### 3-1. 기존 플로우 유지, 백엔드 연동 추가

1. **Welcome** → (변경 없음)
2. **Question 1~12** → 녹음 완료 시:
   - Convex Storage에 음성 업로드 (generateUploadUrl → upload → storageId)
   - Convex action으로 STT 호출
   - `voiceAnswers` mutation으로 DB 저장
   - Zustand에도 유지 (UI 상태)
3. **Analyzing** → 병렬 처리 파이프라인:
   ```
   [12개 답변 완료]
       ↓
   ┌─────────────────────────┐
   │ 병렬 실행               │
   │ 1. 성격 분석 (action)   │ → personalityResults 저장
   │ 2. 보이스 클론 (action) │ → voiceId 저장
   └─────────────────────────┘
       ↓ (둘 다 완료 후)
   ┌─────────────────────────┐
   │ 순차 실행               │
   │ 3. 캐릭터 생성 (action) │ → introText + systemPrompt + speechStyle
   │ 4. TTS 생성 (action)    │ → introAudioStorageId
   └─────────────────────────┘
   ```
4. **Avatar Choice** → `characters` 업데이트
5. **Complete** → `users.onboardingCompleted = true`

### 3-2. QuestionStep 수정
- VoiceRecorder 녹음 완료 → Convex Storage 업로드
- 백그라운드로 STT + DB 저장 (다음 질문 바로 진행 가능)

### 3-3. AnalyzingStep 수정
- Convex action 4개 순차/병렬 호출
- 진행 상태 UI (현재 단계 표시)
- 최소 5초 UX 대기 유지

---

## Phase 4: 캐릭터 생성 로직

### 4-1. `convex/actions/characterGen.ts`
- 입력: personalityResult + transcripts[]
- DeepSeek v3.2로 생성:
  1. **자기소개 텍스트** (3~5문장, 성격 반영, 1인칭, 한국어)
  2. **대화 시스템 프롬프트** (성격 기반 AI 페르소나)
  3. **말투 스타일** (톤, 이모지 빈도, 문장 길이, 유머)
- characters 테이블에 저장

### 4-2. `convex/actions/tts.ts`
- 입력: introText + voiceId
- Supertone TTS API 호출
- 결과 오디오 → Convex Storage 업로드
- introAudioStorageId 업데이트

---

## Phase 5: 모델 변경

### 5-1. 전체 AI 모델을 DeepSeek v3.2로 통일
- 성격 분석 → `deepseek/deepseek-v3.2`
- 대화 생성 → `deepseek/deepseek-v3.2`
- 캐릭터 생성 → `deepseek/deepseek-v3.2`
- 기존 Next.js API route → Convex action으로 이전

### 5-2. 기존 API route 정리
- `/api/personality` → `convex/actions/personality.ts`로 이전
- `/api/chat` → `convex/actions/chat.ts`로 이전 (또는 유지)
- `/api/stt` → `convex/actions/stt.ts`로 이전
- `/api/voice-clone` → `convex/actions/voiceClone.ts`로 이전
- `/api/upload-audio` → 삭제 (Convex Storage 직접 사용)

---

## 파일 생성/수정 목록

### 새로 생성
| 파일 | 설명 |
|------|------|
| `convex/schema.ts` | Convex DB 스키마 |
| `convex/users.ts` | 유저 mutations/queries |
| `convex/voiceAnswers.ts` | 음성 답변 mutations/queries |
| `convex/personalityResults.ts` | 성격 분석 mutations/queries |
| `convex/characters.ts` | 캐릭터 mutations/queries |
| `convex/actions/stt.ts` | Deepgram STT action |
| `convex/actions/personality.ts` | 성격 분석 action |
| `convex/actions/voiceClone.ts` | 보이스 클론 action |
| `convex/actions/characterGen.ts` | 캐릭터 생성 action |
| `convex/actions/tts.ts` | TTS action |
| `convex/actions/chat.ts` | AI 대화 action |
| `convex/auth.config.ts` | Clerk JWT 인증 설정 |
| `src/app/ConvexClientProvider.tsx` | Provider 래퍼 |
| `middleware.ts` | Clerk 인증 미들웨어 |

### 수정
| 파일 | 변경 내용 |
|------|----------|
| `package.json` | `convex`, `@clerk/nextjs` 추가, supabase 제거 |
| `src/app/layout.tsx` | ConvexClientProvider 래핑 |
| `src/app/page.tsx` | Clerk 로그인 버튼 |
| `src/app/onboarding/OnboardingClient.tsx` | Convex hooks 연동 |
| `src/components/onboarding/QuestionStep.tsx` | Convex Storage 업로드 |
| `src/components/onboarding/AnalyzingStep.tsx` | Convex actions 파이프라인 |
| `src/components/onboarding/CompleteStep.tsx` | 완료 mutation |
| `src/stores/onboarding.ts` | Convex userId 연동 |
| `src/types/onboarding.ts` | Character 타입 업데이트 |

### 삭제
| 파일 | 이유 |
|------|------|
| `src/app/api/personality/route.ts` | Convex action으로 이전 |
| `src/app/api/stt/route.ts` | Convex action으로 이전 |
| `src/app/api/voice-clone/route.ts` | Convex action으로 이전 |
| `src/app/api/chat/route.ts` | Convex action으로 이전 |

---

## 구현 순서

1. **Clerk + Convex 셋업** (Phase 1) — 인프라 기반
2. **Convex 스키마 + 함수** (Phase 2) — 데이터 레이어
3. **온보딩 플로우 수정** (Phase 3) — 프론트엔드 연동
4. **캐릭터 생성** (Phase 4) — AI 파이프라인
5. **모델 변경 + API 정리** (Phase 5) — DeepSeek 통일 + 기존 route 제거
