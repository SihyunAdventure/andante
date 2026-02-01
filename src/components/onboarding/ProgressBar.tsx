"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;
  const remaining = total - current;
  const isLastQuestion = current === total;

  return (
    <div className="w-full space-y-3">
      {/* Header with current question and remaining count */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-rose-dark text-sm">
          질문 {current}
        </span>
        <span className="text-rose-dark/50 text-xs">
          {isLastQuestion ? "마지막 질문" : `남은 질문 ${remaining}개`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative w-full bg-warm-200 rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute top-0 left-0 h-full bg-pink-400 rounded-full"
        />
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const stepNumber = i + 1;
          const isAnswered = stepNumber < current;
          const isCurrent = stepNumber === current;

          return (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${isAnswered || isCurrent ? "bg-pink-400" : "bg-warm-200"}
                ${isCurrent ? "ring-2 ring-pink-300" : ""}
              `}
            />
          );
        })}
      </div>
    </div>
  );
}
