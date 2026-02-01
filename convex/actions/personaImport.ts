"use node";

import Anthropic from "@anthropic-ai/sdk";
import { action } from "../_generated/server";
import { v } from "convex/values";

interface PersonalityScores {
  communication_directness: number;
  social_energy: number;
  emotional_expression: number;
  life_approach: number;
}

interface PersonaImportResult {
  scores: PersonalityScores;
  rationale: {
    communication_directness: string;
    social_energy: string;
    emotional_expression: string;
    life_approach: string;
  };
  summary: string;
  confidence: number;
  mbtiType: string;
  mbtiEI: number;
  mbtiSN: number;
  mbtiTF: number;
  mbtiJP: number;
  mbtiConfidence: string;
  avatarPrompt: string;
  introText: string;
  systemPrompt: string;
  speechStyle: {
    tone: string;
    emojiFrequency: string;
    sentenceLength: string;
    humor: string;
  };
}

const ANALYSIS_SYSTEM_PROMPT = `당신은 한국 데이팅 앱 '안단테'의 성격 분석 및 캐릭터 생성 전문가입니다.
사용자가 제공한 페르소나 마크다운 문서를 분석하여 성격 점수와 AI 캐릭터를 한 번에 생성하세요.

마크다운 문서는 ChatGPT 등에서 생성된 자유 형식입니다. YAML frontmatter가 있을 수도, 없을 수도 있습니다.
문서에서 성격, MBTI, 대화 스타일, 관심사 등의 정보를 최대한 추출하세요.

**출력해야 할 JSON:**

{
  "scores": {
    "communication_directness": number (0-100, 0=우회적, 100=직접적),
    "social_energy": number (0-100, 0=내향적, 100=외향적),
    "emotional_expression": number (0-100, 0=절제, 100=풍부),
    "life_approach": number (0-100, 0=계획적, 100=즉흥적)
  },
  "rationale": {
    "communication_directness": "근거 (한국어 2-3문장)",
    "social_energy": "근거",
    "emotional_expression": "근거",
    "life_approach": "근거"
  },
  "summary": "전체 성격 요약 (한국어 2-3문장)",
  "confidence": number (0.0-1.0),
  "mbtiType": "XXXX (예: ENFP)",
  "mbtiEI": number (0-100, 0=I극단, 100=E극단),
  "mbtiSN": number (0-100, 0=S극단, 100=N극단),
  "mbtiTF": number (0-100, 0=T극단, 100=F극단),
  "mbtiJP": number (0-100, 0=J극단, 100=P극단),
  "mbtiConfidence": "high" | "medium" | "low",
  "introText": "자기소개 3-5문장 (한국어, 반말, 1인칭, 데이팅 앱 톤)",
  "systemPrompt": "AI 대화용 시스템 프롬프트 (한국어, 캐릭터 페르소나 설명)",
  "speechStyle": {
    "tone": "대화 톤 설명",
    "emojiFrequency": "거의 안 씀" | "가끔" | "자주",
    "sentenceLength": "짧고 간결" | "보통" | "길고 상세",
    "humor": "유머 스타일"
  }
}

**MBTI → 4차원 매핑 가이드:**
- E/I → social_energy: E가 높으면 social_energy 높음
- T/F → emotional_expression: F가 높으면 emotional_expression 높음
- J/P → life_approach: P가 높으면 life_approach 높음
- communication_directness는 문서의 대화 스타일, 직설적 성향 등에서 추론

문서에 MBTI 정보가 명시되어 있으면 그대로 사용하고, 없으면 문서 내용에서 추론하세요.
반드시 위 JSON만 출력하세요.`;

const AVATAR_PROMPT_SYSTEM = `You are an expert at converting a human profile into a Midjourney portrait prompt.

Read the profile carefully and DO NOT summarize it.

Your task is to translate the person's personality, thinking style, emotional tone, and life narrative into:

1) facial expression
2) gaze
3) overall presence and aura

Do NOT describe literal facts from the profile.
Do NOT mention MBTI, job, hobbies, or story.

Instead, convert the essence of the person into visual mood and character.

Then output a Midjourney-ready portrait prompt in this exact structure:

[Line 1 — character description]
Korean adult, gender inferred from the profile, age inferred naturally, facial mood, hair style suggestion, eyes, expression, aura, elegance level.

[Line 2 — illustration style]
rough crayon drawing texture, naive illustration style, soft graphite strokes, imperfect hand-drawn lines, visible paper grain, subtle smudging, warm muted orange-beige background, minimal shading, cinematic still frame, emotional restraint, delicate line art, Korean illustration mood

[Line 3 — emotional translation]
feels like: a person who ...

Rules:
- The result must feel like a thoughtful, observant, quietly intelligent person
- Crayon texture must define the lines, not the coloring
- No realism, no glossy rendering, no digital painting
- The output must be ONLY the final Midjourney prompt, nothing else`;

export const analyzePersonaMd = action({
  args: {
    markdown: v.string(),
  },
  handler: async (_ctx, args): Promise<PersonaImportResult> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const client = new Anthropic({ apiKey });

    // Run personality analysis + avatar prompt generation in parallel
    const [analysisResponse, avatarResponse] = await Promise.all([
      client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: ANALYSIS_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `다음 페르소나 마크다운을 분석해주세요. JSON만 출력하세요.\n\n${args.markdown}`,
          },
        ],
      }),
      client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: AVATAR_PROMPT_SYSTEM,
        messages: [
          {
            role: "user",
            content: args.markdown,
          },
        ],
      }),
    ]);

    const personalityContent =
      analysisResponse.content[0].type === "text"
        ? analysisResponse.content[0].text
        : "";
    const avatarPrompt =
      avatarResponse.content[0].type === "text"
        ? avatarResponse.content[0].text
        : "";

    if (!personalityContent) {
      throw new Error("No content in personality analysis response");
    }

    let jsonStr = personalityContent.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const result: PersonaImportResult = JSON.parse(jsonStr);
    result.avatarPrompt = avatarPrompt.trim();

    // Basic validation
    if (
      !result.scores ||
      typeof result.scores.communication_directness !== "number" ||
      !result.introText ||
      !result.systemPrompt ||
      !result.mbtiType
    ) {
      throw new Error("LLM returned invalid structure");
    }

    return result;
  },
});
