"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

interface PersonalityScores {
  communication_directness: number;
  social_energy: number;
  emotional_expression: number;
  life_approach: number;
}

function buildSystemPrompt(scores: PersonalityScores): string {
  const directness =
    scores.communication_directness > 60
      ? "직접적인 표현을 좋아해"
      : "간접적이고 우회적인 표현을 선호해";
  const energy =
    scores.social_energy > 60
      ? "사교적이고 사람 만나는 걸 좋아해"
      : "내향적이고 소수의 깊은 관계를 선호해";
  const emotion =
    scores.emotional_expression > 60
      ? "감정 표현이 풍부해"
      : "감정을 절제하는 편이야";
  const approach =
    scores.life_approach > 60
      ? "즉흥적이고 유연해"
      : "계획적이고 체계적이야";

  return `너는 '안단테'라는 데이팅 앱의 AI 대화 상대야. 따뜻하고 자연스러운 대화를 나눠.

상대방 성격:
- ${directness}
- ${energy}
- ${emotion}
- ${approach}

대화 규칙:
- 반말 사용, 친근하고 편안한 톤
- 이모지는 1~2개만 자연스럽게
- 2~3문장으로 짧게 답변 (절대 길게 쓰지 마)
- 상대의 성격에 맞춰 대화 (내향적이면 부담 주지 않기, 절제적이면 감정 강요 안 하기)
- 질문은 한 번에 하나만
- 자연스러운 한국어 사용 (외국어 섞지 마)`;
}

export const send = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    personality: v.object({
      communication_directness: v.number(),
      social_energy: v.number(),
      emotional_expression: v.number(),
      life_approach: v.number(),
    }),
  },
  handler: async (_ctx: any, args: any): Promise<string> => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    if (!args.messages || args.messages.length === 0) {
      throw new Error("No messages provided");
    }

    const systemPrompt = buildSystemPrompt(args.personality);

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
          { role: "system", content: systemPrompt },
          ...args.messages,
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response generated");
    }

    return content;
  },
});
