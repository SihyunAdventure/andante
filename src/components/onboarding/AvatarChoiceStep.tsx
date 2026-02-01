/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Palette, ChevronLeft, Upload } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding";
import type { AvatarMode } from "@/types/onboarding";

const presetAvatars = [
  "/images/personas/01_kim_junhyuk.png",
  "/images/personas/02_lee_seoyeon.png",
  "/images/personas/03_park_minjae.png",
  "/images/personas/04_choi_yujin.png",
  "/images/personas/05_jung_hayun.png",
  "/images/personas/06_han_soojin.png",
];

export default function AvatarChoiceStep() {
  const { avatarMode, setAvatarMode, selectAvatar, setUploadedPhoto, setStep } =
    useOnboardingStore();

  const [selectedMode, setSelectedMode] = useState<AvatarMode | null>(avatarMode);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const handleModeSelect = (mode: AvatarMode) => {
    setSelectedMode(mode);
    setAvatarMode(mode);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setUploadPreview(dataUrl);
        setUploadedPhoto(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadConfirm = () => {
    if (uploadPreview) {
      selectAvatar(uploadPreview);
      setStep("voice-recording");
    }
  };

  const handlePresetSelect = () => {
    if (selectedPreset) {
      selectAvatar(selectedPreset);
      setStep("voice-recording");
    }
  };

  if (!selectedMode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl space-y-8"
        >
          <h2 className="font-serif text-3xl md:text-4xl text-rose-dark text-center mb-12">
            아바타를 만들어요
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModeSelect("upload")}
              className="group relative overflow-hidden bg-gradient-to-br from-pink-400 to-pink-500 rounded-3xl p-8 text-left shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="relative z-10 space-y-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-serif text-2xl text-white">
                  내 사진 업로드하기
                </h3>
                <p className="text-white/90 text-sm">
                  직접 사진을 올려 아바타로 사용해요
                </p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModeSelect("preset")}
              className="group relative overflow-hidden bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-3xl p-8 text-left shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="relative z-10 space-y-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Palette className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-serif text-2xl text-white">
                  프리셋 아바타 고르기
                </h3>
                <p className="text-white/90 text-sm">
                  미리 만들어진 아바타 중 선택
                </p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (selectedMode === "upload") {
    return (
      <div className="flex min-h-screen flex-col bg-cream px-6 py-12">
        <div className="w-full max-w-md mx-auto space-y-8">
          <button
            onClick={() => setSelectedMode(null)}
            className="flex items-center gap-2 text-rose-dark/60 hover:text-rose-dark transition-colors duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
            뒤로
          </button>

          <h2 className="font-serif text-3xl text-rose-dark text-center">
            사진을 업로드해주세요
          </h2>

          <div className="space-y-6">
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <label
              htmlFor="photo-upload"
              className="block w-full aspect-square bg-warm-200 hover:bg-warm-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-colors border-2 border-dashed border-rose-dark/20 overflow-hidden shadow-inner"
            >
              {uploadPreview ? (
                <img
                  src={uploadPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <Upload className="w-12 h-12 text-rose-dark/40 mb-4" />
                  <p className="text-rose-dark/60">사진을 선택하세요</p>
                </>
              )}
            </label>

            {uploadPreview && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleUploadConfirm}
                className="w-full bg-yellow-300 hover:bg-yellow-400 text-rose-dark font-semibold rounded-full px-8 py-4 transition-colors shadow-lg"
              >
                이 사진으로 할래요
              </motion.button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // preset mode
  return (
    <div className="flex min-h-screen flex-col bg-cream px-6 py-12">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => setSelectedMode(null)}
          className="flex items-center gap-2 text-rose-dark/60 hover:text-rose-dark transition-colors duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
          뒤로
        </button>

        <h2 className="font-serif text-3xl text-rose-dark text-center">
          마음에 드는 아바타를 선택하세요
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {presetAvatars.map((avatar, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPreset(avatar)}
              className={`aspect-square rounded-3xl overflow-hidden transition-all ${
                selectedPreset === avatar
                  ? "ring-4 ring-pink-400 shadow-xl"
                  : "shadow-lg hover:shadow-xl"
              }`}
            >
              <img
                src={avatar}
                alt={`Preset ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {selectedPreset && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={handlePresetSelect}
              className="w-full max-w-md mx-auto block bg-yellow-300 hover:bg-yellow-400 text-rose-dark font-semibold rounded-full px-8 py-4 transition-colors shadow-lg"
            >
              이 아바타로 할래요
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
