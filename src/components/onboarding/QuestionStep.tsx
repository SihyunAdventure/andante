"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { useOnboardingStore } from "@/stores/onboarding";
import { questions } from "@/lib/questions";
import ProgressBar from "./ProgressBar";
import VoiceRecorder from "./VoiceRecorder";
import type { VoiceAnswer } from "@/types/onboarding";
import type { Id } from "@/types/convex";

export default function QuestionStep() {
  const {
    currentQuestionIndex,
    answers,
    audioStorageIds,
    convexUserId,
    nextQuestion,
    prevQuestion,
    saveAnswer,
    saveAudioStorageId,
    setStep,
  } = useOnboardingStore();

  const [justRecorded, setJustRecorded] = useState(false);
  const [direction, setDirection] = useState(1);

  const generateUploadUrl = useMutation(api.voiceAnswers.generateUploadUrl);
  const saveVoiceAnswer = useMutation(api.voiceAnswers.saveAnswer);
  const transcribe = useAction(api.actions.stt.transcribe);

  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const savedAnswer = answers.find((a) => a.questionId === currentQuestion.id);
  const hasRecording = justRecorded || !!audioStorageIds[currentQuestion.id];

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    setJustRecorded(true);

    // Save answer with placeholder transcript to Zustand
    const answer: VoiceAnswer = {
      questionId: currentQuestion.id,
      transcript: "", // Will be updated by STT
      duration,
    };
    saveAnswer(answer);

    try {
      // 1. Upload to Convex Storage
      const uploadUrl = await generateUploadUrl();
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type || "audio/webm" },
        body: blob,
      });
      const { storageId } = await uploadResult.json();

      // 2. Save storageId to Zustand
      saveAudioStorageId(currentQuestion.id, storageId);

      // 3. Transcribe via Convex action
      const transcript = await transcribe({
        audioStorageId: storageId as Id<"_storage">,
      });

      // 4. Save answer to Convex
      if (convexUserId) {
        await saveVoiceAnswer({
          userId: convexUserId as Id<"users">,
          questionId: String(currentQuestion.id),
          audioStorageId: storageId as Id<"_storage">,
          transcript,
          durationSeconds: duration,
        });
      }

      // 5. Update Zustand with transcript
      const updatedAnswer: VoiceAnswer = {
        questionId: currentQuestion.id,
        transcript,
        duration,
      };
      saveAnswer(updatedAnswer);
    } catch (error) {
      console.error("Recording processing error:", error);
      // Keep placeholder answer even if processing fails
    }
  };

  const handleNext = () => {
    if (hasRecording) {
      setDirection(1);
      if (isLastQuestion) {
        setStep("analyzing");
      } else {
        nextQuestion();
        setJustRecorded(false);
      }
    }
  };

  const handlePrev = () => {
    if (!isFirstQuestion) {
      setDirection(-1);
      prevQuestion();
      setJustRecorded(false);
    }
  };

  const categoryStyles = {
    personality: "bg-pink-100 text-pink-500",
    lifestyle: "bg-yellow-100 text-yellow-600",
  };

  const categoryLabels = {
    personality: "성격",
    lifestyle: "라이프스타일",
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream px-6 py-8">
      <div className="w-full max-w-2xl mx-auto space-y-8 flex-1 flex flex-col">
        <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion.id}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col justify-center space-y-8"
          >
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <span
                  className={`inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide ${
                    categoryStyles[currentQuestion.category]
                  }`}
                >
                  {categoryLabels[currentQuestion.category]}
                </span>
              </div>

              <h2 className="font-serif text-2xl md:text-3xl text-rose-dark leading-snug px-4">
                {currentQuestion.text}
              </h2>

              {savedAnswer && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mx-4">
                  <p className="text-xs text-rose-dark/50 mb-1">이전 답변</p>
                  <p className="text-sm text-rose-dark/80">
                    {savedAnswer.transcript || "음성 녹음됨 (텍스트 변환 중...)"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between gap-4 pb-8">
          {!isFirstQuestion ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 text-rose-dark/60 hover:text-rose-dark transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
              이전
            </button>
          ) : (
            <div />
          )}

          {hasRecording && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleNext}
              className="bg-yellow-300 hover:bg-yellow-400 text-rose-dark font-semibold rounded-full px-8 py-3 transition-colors duration-200 shadow-lg hover:shadow-xl ml-auto"
            >
              {isLastQuestion ? "완료" : "다음"}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
