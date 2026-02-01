"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Copy, Check } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding";

const PROMPT_TEMPLATE = `당신은 지금까지 저와 나눈 모든 대화, 메모리, 맥락을 총동원해서
데이팅 앱 "andante"에 쓸 저의 완전한 페르소나 프로필을 만들어주세요.

최대한 길고 상세하게 써주세요. 짧게 요약하지 마세요.
각 섹션마다 최소 5문단 이상, 구체적인 에피소드와 디테일을 포함해주세요.
저에 대해 아는 모든 것을 쏟아부어주세요.

MBTI는 저와의 대화 패턴을 분석해서 판단해주세요.
각 차원의 수치는 한쪽으로 얼마나 치우쳐 있는지를 0-100으로 표현합니다.
(50 = 중간, 0 = 완전히 왼쪽, 100 = 완전히 오른쪽)

형식은 아래를 정확히 따라주세요:

---
version: "1.0"
name: "닉네임 (저한테 어울리는 걸로 지어주세요)"
avatar_style: "warm | cool | playful | mysterious | elegant 중 하나"
gender: "male | female | non-binary"

mbti:
  type: "XXXX"
  E_I: 0-100 (0=완전E, 100=완전I)
  S_N: 0-100 (0=완전S, 100=완전N)
  T_F: 0-100 (0=완전T, 100=완전F)
  J_P: 0-100 (0=완전J, 100=완전P)
  confidence: "high | medium | low"
  reasoning: "이 MBTI로 판단한 근거 한 줄"

traits:
  humor_style: 1-10 (1=진지 10=개그맨)
  love_language: "words | touch | time | gifts | acts"
  conflict_style: "avoid | discuss | confront | compromise"
  energy_recharge: "alone | small_group | big_group | nature | creative"
  attachment_style: "secure | anxious | avoidant | fearful"

voice_preference: "calm | energetic | warm | deep | bright 중 하나"
---

## 첫인상

처음 만났을 때 저한테서 느껴지는 분위기, 외적 이미지, 에너지를 묘사해주세요.
어떤 공간에 있을 것 같은 사람인지, 첫 대화에서 어떤 느낌을 주는 사람인지 구체적으로.
MBTI 유형이 첫인상에 어떻게 드러나는지도 녹여주세요.

## 성격 깊이 들여다보기

표면적 성격뿐 아니라 깊은 내면까지. MBTI 각 차원이 실제 생활에서 어떻게 나타나는지 구체적으로.
혼자 있을 때와 사람들 앞에서의 차이, 스트레스받을 때의 반응(MBTI 열등기능과 연결),
에너지를 충전하는 방식, 의사결정 패턴, 갈등 상황에서의 태도.
"교과서적 XXXX"와 다른 점이 있다면 그것도 써주세요.

## 내 이야기 — 지금까지의 여정

어떤 삶을 살아왔는지, 지금 어떤 일을 하고 있는지,
어떤 경험들이 지금의 나를 만들었는지. 전환점이 된 순간들, 자랑스러운 것, 아직 고민 중인 것.

## 대화할 때 나는

말투, 자주 쓰는 표현, 이모티콘/이모지 습관, 리액션 스타일,
진지한 대화와 가벼운 대화의 비율, 대화 주도권을 잡는 편인지 맞장구치는 편인지,
텍스트 길이 습관, 답장 속도 패턴, 농담 스타일,
화났을 때/기쁠 때/슬플 때 각각의 말투 변화까지.

## 머릿속을 채우고 있는 것들

요즘 관심사, 오래된 관심사, 깊이 파고드는 주제들, 가볍게 즐기는 것들.
뉴스/유튜브/팟캐스트에서 뭘 보는지, SNS에서 어떤 걸 저장하는지,
알고리즘이 나에게 뭘 추천하는지.

## 취미와 일상

평일 루틴, 주말에 주로 하는 것, 계절마다 달라지는 활동,
혼자 하는 취미와 같이 하는 취미, 돈을 아끼지 않는 분야,
시간 가는 줄 모르고 빠지는 것.

## 음식, 음악, 영화, 공간

좋아하는 음식/카페/식당 스타일, 플레이리스트에 뭐가 있는지,
인생 영화/드라마/책, 자주 가는 장소, 여행 스타일,
분위기 있다고 느끼는 공간의 특징.

## 사람과 관계에 대한 생각

우정관, 가족과의 관계, 사람을 사귈 때 중요하게 보는 것,
싫어하는 유형, 끌리는 유형, 신뢰를 쌓는 방식,
갈등을 해결하는 방식, 사과와 용서에 대한 태도.

## 연애 — 솔직하게

과거 연애에서 배운 것, 잘했던 것과 못했던 것,
사랑의 언어(선물/스킨십/말/시간/행동 중), 질투에 대한 태도, 연락 빈도 선호,
이상적인 관계의 모습, 절대 양보 못하는 것,
첫 데이트에서 하고 싶은 것, 100일 후에 하고 싶은 것.
MBTI 궁합에서 기대하는 것과 열린 마음인 부분도.

## 가치관과 세계관

인생에서 제일 중요한 것 3가지, 돈/성공/행복에 대한 생각,
정치/사회 이슈에 대한 관심도, 종교관, 미래에 대한 계획,
5년 후/10년 후 어떤 삶을 살고 싶은지.

## 나의 약점과 매력

스스로 인정하는 단점, 고치고 싶은 습관,
MBTI 유형의 전형적 약점 중 나에게 해당되는 것,
반대로 자신 있는 매력 포인트, 주변에서 자주 듣는 칭찬,
의외라는 소리를 듣는 갭.

## 이런 대화를 하고 싶어요

첫 만남에서 나누고 싶은 대화 주제, 깊어지면 하고 싶은 대화,
피하고 싶은 주제, 밤새 이야기할 수 있는 주제,
상대방이 이런 말을 하면 호감이 올라가는 것.

## 한 줄로 나를 표현하면

임팩트 있는 한 문장.

## TMI

위 카테고리에 안 들어가지만 나를 이해하는 데 중요한 것들.
독특한 습관, 별자리, 혈액형, 잠버릇, 아침형/저녁형, 고양이파/강아지파 등 뭐든.`;

export default function PersonaImportStep() {
  const { setPersonaMarkdown, setStep } = useOnboardingStore();
  const [markdown, setMarkdown] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(PROMPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    const trimmed = markdown.trim();
    if (trimmed.length < 50) {
      setError("내용이 너무 짧습니다. ChatGPT에서 생성한 페르소나 문서를 붙여넣어주세요.");
      return;
    }
    setError(null);
    setPersonaMarkdown(trimmed);
    setStep("analyzing");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <h1 className="font-serif text-3xl md:text-4xl text-rose-dark mb-4 text-center">
          페르소나 파일 가져오기
        </h1>
        <p className="text-rose-dark/60 text-sm text-center mb-8">
          ChatGPT에게 아래 프롬프트를 보내고, 결과를 붙여넣어주세요.
        </p>

        {/* Prompt template */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 mb-6 shadow-sm border border-rose-dark/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-rose-dark/70 text-xs font-medium">
              <FileText className="w-4 h-4" />
              ChatGPT 프롬프트
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-pink-500 hover:text-pink-600 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  복사
                </>
              )}
            </button>
          </div>
          <pre className="text-xs text-rose-dark/60 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
            {PROMPT_TEMPLATE}
          </pre>
        </div>

        {/* Textarea */}
        <textarea
          value={markdown}
          onChange={(e) => {
            setMarkdown(e.target.value);
            if (error) setError(null);
          }}
          placeholder="ChatGPT의 응답을 여기에 붙여넣어주세요..."
          className="w-full h-48 bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-rose-dark/10 text-rose-dark text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder:text-rose-dark/30"
        />

        {error && (
          <p className="text-red-500 text-xs mt-2">{error}</p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setStep("welcome")}
            className="flex-1 bg-white/60 hover:bg-white/80 text-rose-dark font-medium rounded-full px-6 py-3.5 transition-colors duration-200 text-sm"
          >
            돌아가기
          </button>
          <button
            onClick={handleSubmit}
            disabled={markdown.trim().length < 50}
            className="flex-1 bg-yellow-300 hover:bg-yellow-400 disabled:bg-gray-200 disabled:text-gray-400 text-rose-dark font-semibold rounded-full px-6 py-3.5 transition-colors duration-200 shadow-lg hover:shadow-xl disabled:shadow-none text-sm"
          >
            분석하기
          </button>
        </div>
      </motion.div>
    </div>
  );
}
