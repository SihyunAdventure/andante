"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, RotateCcw } from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useOnboardingStore } from "@/stores/onboarding";
import type { Id } from "@/types/convex";

const READING_PROMPT = `안녕하세요, 저는 안단테에서 새로운 인연을 찾고 있어요.
평소에는 조용한 편이지만, 좋아하는 사람 앞에서는 말이 많아지는 타입이에요.
주말에는 카페에서 책을 읽거나, 좋아하는 음악을 들으며 산책하는 걸 즐겨요.
맛있는 음식을 같이 먹으러 다니는 걸 좋아하고, 여행도 함께 가고 싶어요.
서로의 일상을 편하게 나눌 수 있는 사이가 되면 좋겠습니다.`;

const MIN_DURATION = 15; // seconds
const MAX_DURATION = 30;

export default function VoiceRecordingStep() {
  const { convexUserId, setVoiceId, setStep } = useOnboardingStore();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateUploadUrl = useMutation(api.voiceAnswers.generateUploadUrl);
  const cloneVoice = useAction(api.actions.voiceClone.cloneVoice);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      setError(null);

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= MAX_DURATION - 1) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setError("마이크 권한을 허용해주세요.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setDuration(0);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;
    if (duration < MIN_DURATION) {
      setError(`최소 ${MIN_DURATION}초 이상 녹음해주세요.`);
      return;
    }

    setIsUploading(true);
    try {
      // Upload audio to Convex storage
      const uploadUrl = await generateUploadUrl();
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": audioBlob.type },
        body: audioBlob,
      });
      const { storageId } = await uploadResponse.json();

      // Clone voice using storage ID
      if (convexUserId && storageId) {
        try {
          const voiceId = await cloneVoice({
            audioStorageIds: [storageId as Id<"_storage">],
            name: `Andante_${Date.now()}`,
          });
          if (voiceId) setVoiceId(voiceId);
        } catch (err) {
          console.error("Voice clone error:", err);
        }
      }

      setStep("complete");
    } catch (err) {
      console.error("Upload error:", err);
      setError("업로드 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    setStep("complete");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const progress = Math.min(duration / MAX_DURATION, 1);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg text-center"
      >
        <h1 className="font-serif text-3xl md:text-4xl text-rose-dark mb-3">
          목소리를 들려주세요
        </h1>
        <p className="text-rose-dark/60 text-sm mb-8">
          아래 문장을 자연스럽게 읽어주세요. 당신의 목소리로 캐릭터가 말하게 됩니다.
        </p>

        {/* Reading prompt */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-sm border border-rose-dark/10 text-left">
          <p className="text-rose-dark text-sm leading-relaxed whitespace-pre-line">
            {READING_PROMPT}
          </p>
        </div>

        {/* Recording UI */}
        <div className="flex flex-col items-center gap-6 mb-8">
          {/* Progress ring */}
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="45"
                fill="none" stroke="#f3e8e8" strokeWidth="6"
              />
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke={isRecording ? "#f472b6" : "#d1d5db"}
                strokeWidth="6"
                strokeDasharray={`${progress * 283} 283`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <button
              onClick={isRecording ? stopRecording : audioBlob ? resetRecording : startRecording}
              className="absolute inset-0 flex items-center justify-center"
            >
              {audioBlob && !isRecording ? (
                <RotateCcw className="w-8 h-8 text-rose-dark/60" />
              ) : isRecording ? (
                <MicOff className="w-8 h-8 text-pink-500" />
              ) : (
                <Mic className="w-8 h-8 text-rose-dark/60" />
              )}
            </button>
          </div>

          <p className="text-rose-dark/60 text-sm">
            {isRecording
              ? `녹음 중... ${duration}초 / ${MAX_DURATION}초`
              : audioBlob
                ? `${duration}초 녹음 완료`
                : "마이크 버튼을 눌러 녹음을 시작하세요"}
          </p>
        </div>

        {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 bg-white/60 hover:bg-white/80 text-rose-dark font-medium rounded-full px-6 py-3.5 transition-colors duration-200 text-sm"
          >
            건너뛰기
          </button>
          <button
            onClick={handleSubmit}
            disabled={!audioBlob || duration < MIN_DURATION || isUploading}
            className="flex-1 bg-yellow-300 hover:bg-yellow-400 disabled:bg-gray-200 disabled:text-gray-400 text-rose-dark font-semibold rounded-full px-6 py-3.5 transition-colors duration-200 shadow-lg hover:shadow-xl disabled:shadow-none text-sm"
          >
            {isUploading ? "처리 중..." : "완료"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
