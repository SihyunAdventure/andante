"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

interface PersonalityScores {
  communication_directness: number;
  social_energy: number;
  emotional_expression: number;
  life_approach: number;
}

interface PersonalityRationale {
  communication_directness: string;
  social_energy: string;
  emotional_expression: string;
  life_approach: string;
}

interface PersonalityResult {
  scores: PersonalityScores;
  rationale: PersonalityRationale;
  summary: string;
  confidence: number;
}

const QUESTIONS: Record<number, string> = {
  1: "주말에 주로 뭘 하면서 시간을 보내세요?",
  2: "친한 친구들은 당신을 어떤 사람이라고 말할까요?",
  3: "요즘 가장 빠져 있는 취미나 관심사가 있나요?",
  4: "새로운 사람을 만났을 때 보통 어떤 편이에요?",
  5: "가장 좋아하는 음식이나 맛집이 있다면 알려주세요.",
  6: "스트레스를 받으면 주로 어떻게 풀어요?",
  7: "최근에 본 영화, 드라마, 책 중에 인상 깊었던 건?",
  8: "중요한 결정을 내릴 때 어떤 방식으로 하는 편이에요?",
  9: "여행을 간다면 어떤 스타일로 다니는 편이에요?",
  10: "혼자만의 시간과 사람들과 함께하는 시간, 어느 쪽이 더 좋아요?",
  11: "일상에서 가장 소중하게 여기는 루틴이 있나요?",
  12: "5년 후의 자신은 어떤 모습이길 바라세요?",
};

const SYSTEM_PROMPT = `당신은 한국 데이팅 앱의 성격 분석 전문가입니다. 사용자의 12개 질문 답변을 바탕으로 다음 4가지 차원의 성격을 분석하세요.

**4가지 성격 차원:**

1. **communication_directness (의사소통 직접성)** - 0~100점
   - 0점: 매우 우회적, 간접적 표현 선호, 상황과 맥락 중시
   - 50점: 상황에 따라 직접적/간접적 표현을 섞어 사용
   - 100점: 매우 직접적, 솔직하고 명확한 표현 선호

   평가 기준:
   - 답변의 구체성과 명확성
   - 완곡어법 vs 직설적 표현
   - 한국 문화의 체면과 겸손 고려

2. **social_energy (사회적 에너지)** - 0~100점
   - 0점: 극도의 내향성, 혼자만의 시간 필수, 소수와의 깊은 관계 선호
   - 50점: 상황에 따라 사교적이거나 조용할 수 있음
   - 100점: 극도의 외향성, 사람들과의 교류에서 에너지 충전, 넓은 인간관계 선호

   평가 기준:
   - 주말 활동 (혼자 vs 함께)
   - 새로운 사람 만나기에 대한 태도
   - 혼자 vs 사람들과 함께하는 시간 선호도

3. **emotional_expression (감정 표현)** - 0~100점
   - 0점: 매우 절제적, 감정을 잘 드러내지 않음, 이성적 대처
   - 50점: 상황에 따라 감정 표현 조절
   - 100점: 매우 풍부, 감정을 솔직하게 표현, 감성적 대처

   평가 기준:
   - 스트레스 대처 방식 (이성적 vs 감성적)
   - 친구들이 보는 성격 묘사
   - 답변의 감정적 뉘앙스와 표현

4. **life_approach (삶의 접근)** - 0~100점
   - 0점: 매우 계획적, 체계적, 루틴과 일정 중시
   - 50점: 계획과 즉흥을 적절히 혼합
   - 100점: 매우 즉흥적, 자유로움, 융통성과 모험 중시

   평가 기준:
   - 여행 스타일 (계획적 vs 즉흥적)
   - 결정 방식 (신중한 분석 vs 직관과 느낌)
   - 일상 루틴과 계획성

**한국 문화적 맥락 고려사항:**
- 겸손과 자기 비하적 표현은 낮은 점수가 아니라 문화적 예의일 수 있음
- 간접적 표현은 배려와 체면을 중시하는 문화적 특징
- "괜찮다", "그냥" 같은 표현 뒤에 숨은 진짜 의미 파악

**분석 방법:**
각 차원별로 답변을 종합적으로 분석하고, 다음을 제공하세요:
1. 각 차원의 점수 (0~100)
2. 각 차원의 점수를 매긴 근거 (2~3문장, 한국어)
3. 전체 성격에 대한 요약 (2~3문장, 한국어)
4. 분석의 신뢰도 (0.0~1.0)

**출력 형식:**
반드시 다음 JSON 스키마를 엄격히 따르세요:
{
  "scores": {
    "communication_directness": number,
    "social_energy": number,
    "emotional_expression": number,
    "life_approach": number
  },
  "rationale": {
    "communication_directness": string,
    "social_energy": string,
    "emotional_expression": string,
    "life_approach": string
  },
  "summary": string,
  "confidence": number
}`;

const FALLBACK_RESULT: PersonalityResult = {
  scores: {
    communication_directness: 50,
    social_energy: 50,
    emotional_expression: 50,
    life_approach: 50,
  },
  rationale: {
    communication_directness: "분석 불가",
    social_energy: "분석 불가",
    emotional_expression: "분석 불가",
    life_approach: "분석 불가",
  },
  summary: "성격 분석을 완료할 수 없습니다",
  confidence: 0,
};

export const analyze = action({
  args: {
    answers: v.array(
      v.object({
        questionId: v.string(),
        transcript: v.string(),
      })
    ),
  },
  handler: async (_ctx: any, args: any): Promise<PersonalityResult> => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not configured");
      return {
        ...FALLBACK_RESULT,
        summary: "성격 분석 서비스가 설정되지 않았습니다",
      };
    }

    if (!args.answers || args.answers.length === 0) {
      return {
        ...FALLBACK_RESULT,
        summary: "답변 데이터가 없습니다",
      };
    }

    const userMessage = args.answers
      .map((answer: any) => {
        const questionText =
          QUESTIONS[Number(answer.questionId)] ||
          `질문 ${answer.questionId}`;
        return `질문: ${questionText}\n답변: ${answer.transcript}`;
      })
      .join("\n\n");

    try {
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
            {
              role: "user",
              content:
                userMessage +
                "\n\n반드시 위에서 지정한 JSON 형식으로만 응답하세요. JSON 외의 텍스트는 포함하지 마세요.",
            },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API error:", response.status, errorText);
        return {
          ...FALLBACK_RESULT,
          summary: `API 오류: ${response.status}`,
        };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No content in OpenRouter response");
      }

      // Try to extract JSON from response (handle markdown code blocks)
      let jsonStr = content.trim();
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const personalityResult: PersonalityResult = JSON.parse(jsonStr);

      // Validate structure
      if (
        !personalityResult.scores ||
        typeof personalityResult.scores.communication_directness !== "number" ||
        typeof personalityResult.scores.social_energy !== "number" ||
        typeof personalityResult.scores.emotional_expression !== "number" ||
        typeof personalityResult.scores.life_approach !== "number" ||
        !personalityResult.rationale ||
        typeof personalityResult.rationale.communication_directness !== "string" ||
        typeof personalityResult.rationale.social_energy !== "string" ||
        typeof personalityResult.rationale.emotional_expression !== "string" ||
        typeof personalityResult.rationale.life_approach !== "string" ||
        !personalityResult.summary ||
        typeof personalityResult.confidence !== "number"
      ) {
        console.error("Invalid personality result structure:", personalityResult);
        return FALLBACK_RESULT;
      }

      return personalityResult;
    } catch (error) {
      console.error("Personality analysis error:", error);
      return {
        ...FALLBACK_RESULT,
        summary:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다",
      };
    }
  },
});
