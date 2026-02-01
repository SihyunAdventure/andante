/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useOnboardingStore } from "@/stores/onboarding";
import type { Id } from "@/types/convex";

const dimensionLabels: Record<
  string,
  { label: string; low: string; high: string }
> = {
  communication_directness: {
    label: "소통 방식",
    low: "우회적",
    high: "직접적",
  },
  social_energy: { label: "사회적 에너지", low: "내향적", high: "외향적" },
  emotional_expression: { label: "감정 표현", low: "차분한", high: "풍부한" },
  life_approach: { label: "삶의 접근", low: "계획적", high: "즉흥적" },
};

export default function CompleteStep() {
  const { selectedAvatar, personalityResult, voiceId, convexUserId, introText } =
    useOnboardingStore();
  const [expandedDimension, setExpandedDimension] = useState<string | null>(
    null
  );

  const markOnboardingComplete = useMutation(api.users.markOnboardingComplete);

  useEffect(() => {
    useOnboardingStore.setState({ completedAt: new Date().toISOString() });

    // Mark onboarding complete in Convex
    if (convexUserId) {
      markOnboardingComplete({
        userId: convexUserId as Id<"users">,
      }).catch((err) => console.error("Failed to mark onboarding complete:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-cream px-6 py-12">
      <div className="w-full max-w-2xl mx-auto space-y-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="text-center space-y-8"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
            className="flex justify-center"
          >
            {selectedAvatar && (
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-gradient-to-br from-pink-300 to-yellow-300 rounded-full blur-2xl opacity-40"
                />
                <img
                  src={selectedAvatar}
                  alt="Selected avatar"
                  className="relative w-32 h-32 rounded-full object-cover shadow-2xl ring-4 ring-white"
                />
              </div>
            )}
          </motion.div>

          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="font-serif text-4xl md:text-5xl text-rose-dark"
          >
            온보딩 완료!
          </motion.h1>
        </motion.div>

        {introText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl"
          >
            <h2 className="font-serif text-lg text-rose-dark text-center mb-3">
              캐릭터 자기소개
            </h2>
            <p className="text-sm text-rose-dark/80 leading-relaxed text-center">
              {introText}
            </p>
          </motion.div>
        )}

        {personalityResult && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 space-y-6 shadow-xl"
          >
            <h2 className="font-serif text-2xl text-rose-dark text-center mb-6">
              당신의 성격 분석
            </h2>

            <div className="space-y-6">
              {Object.entries(personalityResult.scores).map(
                ([key, value], index) => {
                  const dimension = dimensionLabels[key];
                  const isExpanded = expandedDimension === key;
                  const rationale = personalityResult.rationale[
                    key as keyof typeof personalityResult.rationale
                  ];

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-rose-dark">
                          {dimension.label}
                        </span>
                        <span className="text-sm text-rose-dark/60">
                          {Math.round(value as number)}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setExpandedDimension(isExpanded ? null : key)
                        }
                        className="w-full text-left group"
                      >
                        <div className="relative w-full bg-warm-200 rounded-full h-3 overflow-hidden transition-all duration-200 group-hover:h-4">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{
                              duration: 1,
                              delay: 0.6 + index * 0.1,
                              ease: "easeOut",
                            }}
                            className="absolute top-0 left-0 h-full bg-pink-400 rounded-full"
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-rose-dark/40">
                            {dimension.low}
                          </span>
                          <span className="text-xs text-rose-dark/40">
                            {dimension.high}
                          </span>
                        </div>
                      </button>

                      {isExpanded && rationale && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 p-4 bg-pink-50/50 rounded-xl"
                        >
                          <p className="text-sm text-rose-dark/70 leading-relaxed">
                            {rationale}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  );
                }
              )}
            </div>

            <div className="pt-4 border-t border-rose-dark/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-rose-dark/60">
                  분석 신뢰도
                </span>
                <span className="text-sm font-semibold text-rose-dark">
                  {Math.round(personalityResult.confidence * 100)}%
                </span>
              </div>

              <p className="text-rose-dark/80 text-sm leading-relaxed">
                {personalityResult.summary}
              </p>
            </div>
          </motion.div>
        )}

        {voiceId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="font-serif text-lg text-rose-dark">목소리 학습 완료</span>
            </div>
            <p className="text-sm text-rose-dark/60">
              당신의 목소리가 성공적으로 학습되었어요
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center"
        >
          <Link
            href="/"
            className="inline-block bg-yellow-300 hover:bg-yellow-400 text-rose-dark font-semibold rounded-full px-12 py-4 transition-colors duration-200 shadow-lg hover:shadow-xl text-base"
          >
            Andante 시작하기
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
