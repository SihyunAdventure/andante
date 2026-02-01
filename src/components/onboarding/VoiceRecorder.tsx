"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, RotateCcw, Check } from "lucide-react";
import { motion } from "framer-motion";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
}

type RecorderState = "idle" | "recording" | "recorded";

export default function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);
  const durationRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Try webm first, fallback to mp4 for Safari
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        recordedBlobRef.current = blob;
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setState("recording");
      setDuration(0);
      durationRef.current = 0;

      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);
        if (durationRef.current >= 60) {
          // Auto-stop: directly stop MediaRecorder and clean up
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
          }
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setState("recorded");
        }
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("마이크 권한이 필요합니다. 브라우저 설정에서 마이크 접근을 허용해주세요.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === "recording") {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setState("recorded");
    }
  };

  const playRecording = () => {
    if (recordedBlobRef.current) {
      const url = URL.createObjectURL(recordedBlobRef.current);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };

      audio.play();
      setIsPlaying(true);
    }
  };

  const reRecord = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    recordedBlobRef.current = null;
    setState("idle");
    setDuration(0);
  };

  const confirmRecording = () => {
    if (recordedBlobRef.current && duration >= 3) {
      onRecordingComplete(recordedBlobRef.current, duration);
    }
  };

  if (state === "idle") {
    return (
      <div className="flex flex-col items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={startRecording}
          className="w-24 h-24 bg-pink-400 hover:bg-pink-500 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-xl hover:shadow-2xl"
        >
          <Mic className="w-10 h-10" />
        </motion.button>
        <p className="text-rose-dark/50 text-xs mt-3">탭하여 녹음 시작</p>
        {error && (
          <p className="text-sm text-red-500 text-center max-w-xs">{error}</p>
        )}
      </div>
    );
  }

  if (state === "recording") {
    return (
      <div className="flex flex-col items-center gap-4">
        <motion.button
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={stopRecording}
          className="w-24 h-24 bg-pink-400 text-white rounded-full flex items-center justify-center ring-4 ring-pink-200/60 shadow-xl"
        >
          <Square className="w-8 h-8" />
        </motion.button>
        <p className="text-3xl font-mono text-rose-dark tracking-wider">{formatTime(duration)}</p>
        <p className="text-rose-dark/50 text-xs mt-3">탭하여 녹음 종료</p>
      </div>
    );
  }

  // recorded state
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4">
        <button
          onClick={playRecording}
          disabled={isPlaying}
          className="w-12 h-12 bg-pink-100 hover:bg-pink-200 disabled:opacity-50 text-pink-500 rounded-full flex items-center justify-center transition-colors shadow-md"
        >
          <Play className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-lg font-mono text-rose-dark/80">{formatTime(duration)}</p>
          <p className="text-xs text-rose-dark/60">녹음됨</p>
        </div>
        <button
          onClick={reRecord}
          className="w-12 h-12 bg-warm-200 hover:bg-warm-300 text-rose-dark/60 rounded-full flex items-center justify-center transition-colors shadow-md"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {duration < 3 && (
        <p className="text-sm text-red-500">최소 3초 이상 녹음해주세요</p>
      )}

      {duration >= 3 && (
        <button
          onClick={confirmRecording}
          className="flex items-center gap-2 bg-yellow-300 hover:bg-yellow-400 text-rose-dark font-semibold rounded-full px-8 py-3 transition-colors duration-200 shadow-lg"
        >
          <Check className="w-5 h-5" />
          이 답변으로 할게요
        </button>
      )}
    </div>
  );
}
