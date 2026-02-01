"use client";

import { motion } from "framer-motion";
import { Mic, Brain, Palette, FileText } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding";

const infoItems = [
  {
    icon: Mic,
    text: "12개의 질문에 목소리로 답해주세요",
  },
  {
    icon: Brain,
    text: "AI가 당신의 성격을 분석합니다",
  },
  {
    icon: Palette,
    text: "나만의 아바타를 만들어요",
  },
];

export default function WelcomeStep() {
  const setStep = useOnboardingStore((state) => state.setStep);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md text-center"
      >
        <h1 className="font-serif text-4xl md:text-5xl text-rose-dark mb-12">
          당신에 대해 알려주세요
        </h1>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          className="space-y-6 mb-12"
        >
          {infoItems.map((item, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
              className="flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-sm"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-pink-400 rounded-full flex items-center justify-center shadow-md">
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-left text-rose-dark text-sm md:text-base">
                {item.text}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="space-y-4"
        >
          <button
            onClick={() => setStep("questions")}
            className="w-full bg-yellow-300 hover:bg-yellow-400 text-rose-dark font-semibold rounded-full px-8 py-4 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            시작하기
          </button>
          <p className="text-rose-dark/50 text-xs">약 5-7분 소요</p>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-rose-dark/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-cream px-3 text-rose-dark/40">또는</span>
            </div>
          </div>

          <button
            onClick={() => setStep("persona-import")}
            className="w-full flex items-center justify-center gap-2 bg-white/60 hover:bg-white/80 text-rose-dark font-medium rounded-full px-8 py-3.5 transition-colors duration-200 border border-rose-dark/10"
          >
            <FileText className="w-4 h-4" />
            페르소나 파일로 시작하기
          </button>
          <p className="text-rose-dark/50 text-xs">ChatGPT가 만든 페르소나 MD 사용</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
