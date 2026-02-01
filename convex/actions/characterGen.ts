"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

interface CharacterGenResult {
  introText: string;
  systemPrompt: string;
  speechStyle: {
    tone: string;
    emojiFrequency: string;
    sentenceLength: string;
    humor: string;
  };
}

const SYSTEM_PROMPT = `당신은 한국 데이팅 앱 '안단테'의 캐릭터 생성 전문가입니다.
사용자의 성격 분석 결과와 실제 답변을 바탕으로 AI 캐릭터를 생성하세요.

다음 3가지를 JSON으로 생성하세요:

1. **introText**: 자기소개 텍스트
   - 3~5문장
   - 성격이 자연스럽게 드러나도록
   - 1인칭 시점
   - 한국어, 반말 사용
   - 데이팅 앱에 어울리는 자연스럽고 매력적인 톤

2. **systemPrompt**: AI 대화용 시스템 프롬프트
   - 이 캐릭터가 대화할 때 사용할 페르소나 설명
   - 성격 특성이 대화에 반영되도록
   - 말투, 관심사, 성격적 특징 포함
   - 한국어로 작성

3. **speechStyle**: 말하기 스타일
   - tone: 대화 톤 (예: "따뜻하고 친근한", "쿨하고 담백한", "밝고 에너지 넘치는")
   - emojiFrequency: 이모지 사용 빈도 ("거의 안 씀", "가끔", "자주")
   - sentenceLength: 문장 길이 ("짧고 간결", "보통", "길고 상세")
   - humor: 유머 스타일 ("드라이", "재치있는", "과장된", "자연스러운")

**출력 형식:**
반드시 다음 JSON만 출력하세요:
{
  "introText": string,
  "systemPrompt": string,
  "speechStyle": {
    "tone": string,
    "emojiFrequency": string,
    "sentenceLength": string,
    "humor": string
  }
}`;

export const generate = action({
  args: {
    personalityScores: v.object({
      communication_directness: v.number(),
      social_energy: v.number(),
      emotional_expression: v.number(),
      life_approach: v.number(),
    }),
    transcripts: v.array(v.string()),
    summary: v.string(),
  },
  handler: async (_ctx: any, args: any): Promise<CharacterGenResult> => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    const { personalityScores, transcripts, summary } = args;

    const userMessage = `**성격 분석 결과:**
- 의사소통 직접성: ${personalityScores.communication_directness}/100
- 사회적 에너지: ${personalityScores.social_energy}/100
- 감정 표현: ${personalityScores.emotional_expression}/100
- 삶의 접근: ${personalityScores.life_approach}/100

**성격 요약:** ${summary}

**실제 답변들:**
${transcripts.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}

위 정보를 바탕으로 캐릭터를 생성해주세요. JSON만 출력하세요.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://andante.app",
        "X-Title": "Andante",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v3.2",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenRouter response");
    }

    // Extract JSON from possible markdown code blocks
    let jsonStr = content.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const result: CharacterGenResult = JSON.parse(jsonStr);

    // Validate structure
    if (
      !result.introText ||
      !result.systemPrompt ||
      !result.speechStyle ||
      !result.speechStyle.tone ||
      !result.speechStyle.emojiFrequency ||
      !result.speechStyle.sentenceLength ||
      !result.speechStyle.humor
    ) {
      throw new Error("Invalid character generation result structure");
    }

    return result;
  },
});
