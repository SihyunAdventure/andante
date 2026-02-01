"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const chatMessages = [
  { side: "left" as const, name: "Jimin's Avatar", text: "요즘 빠진 취미가 있어요?" },
  { side: "right" as const, name: "Suhyun's Avatar", text: "재즈 카페 찾아다니는 거요!" },
  { side: "left" as const, name: "Jimin's Avatar", text: "저도 음악 듣는 거 좋아해요" },
];

const headlineWords = ["Your", "Avatar", "Speaks", "First."];

const avatarCards = [
  { id: "01", name: "준혁", age: 32, video: "/videos/01_kim_junhyuk.mp4", poster: "/images/personas/01_kim_junhyuk.png" },
  { id: "02", name: "서연", age: 29, video: "/videos/02_lee_seoyeon.mp4", poster: "/images/personas/02_lee_seoyeon.png" },
  { id: "03", name: "민재", age: 35, video: "/videos/03_park_minjae.mp4", poster: "/images/personas/03_park_minjae.png" },
  { id: "04", name: "유진", age: 27, video: "/videos/04_choi_yujin.mp4", poster: "/images/personas/04_choi_yujin.png" },
  { id: "05", name: "하윤", age: 31, video: "/videos/05_jung_hayun.mp4", poster: "/images/personas/05_jung_hayun.png" },
  { id: "06", name: "수진", age: 26, video: "/videos/06_han_soojin.mp4", poster: "/images/personas/06_han_soojin.png" },
  { id: "07", name: "지훈", age: 28, video: "/videos/07_song_jihoon.mp4", poster: "/images/personas/07_song_jihoon.png" },
  { id: "08", name: "민지", age: 30, video: "/videos/08_yoon_minji.mp4", poster: "/images/personas/08_yoon_minji.png" },
  { id: "09", name: "도하", age: 33, video: "/videos/09_kang_doha.mp4", poster: "/images/personas/09_kang_doha.png" },
  { id: "10", name: "나영", age: 25, video: "/videos/10_im_nayoung.mp4", poster: "/images/personas/10_im_nayoung.png" },
];

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <section ref={sectionRef} className="noise-overlay relative min-h-screen overflow-hidden">
      {/* Dark rosé background with warm yellow glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-dark via-rose-dark to-[#302828]" />

      {/* Parallax blobs - yellow prominent */}
      <motion.div
        style={{ y: blob1Y }}
        className="absolute -top-20 right-[5%] h-[700px] w-[700px] rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-300/8 blur-3xl animate-float-slow"
      />
      <motion.div
        style={{ y: blob2Y }}
        className="absolute top-1/3 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-pink-400/12 to-pink-300/5 blur-3xl animate-float"
      />
      <motion.div
        style={{ y: blob1Y }}
        className="absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-yellow-300/15 to-yellow-200/5 blur-3xl animate-float"
      />

      {/* Content */}
      <div className="relative mx-auto flex max-w-7xl flex-col px-6 pt-36 pb-16 md:min-h-[70vh] md:flex-row md:items-center md:gap-12 md:px-12 md:pt-0 md:pb-20">
        {/* Left: Text */}
        <div className="flex-1 md:py-20">
          {/* Headline - word by word stagger */}
          <h1 className="mb-6">
            {headlineWords.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.2 + i * 0.12,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className={`mr-[0.25em] inline-block font-serif text-6xl italic leading-[1.05] tracking-tight sm:text-7xl md:text-[100px] lg:text-[120px] ${
                  word === "First." ? "text-yellow-300" : "text-cream"
                }`}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Korean subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="mb-10 max-w-md text-base leading-relaxed text-cream/45 md:text-lg"
          >
            아바타가 당신 대신 먼저 대화합니다.
            <br />
            천천히, 자연스럽게.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex items-center gap-5"
          >
            <a
              href="#cta"
              className="group inline-flex h-14 items-center gap-2.5 rounded-full bg-yellow-300 px-9 text-[15px] font-medium text-rose-dark shadow-xl shadow-yellow-400/20 transition-all hover:bg-yellow-200 hover:shadow-2xl hover:shadow-yellow-400/30"
            >
              Get Started
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <span className="text-xs text-cream/25">완전 무료로 시작</span>
          </motion.div>
        </div>

        {/* Right: Floating chat card */}
        <motion.div
          style={{ y: cardY }}
          className="relative mt-16 w-full max-w-sm md:mt-0 md:flex-1"
        >
          <motion.div
            initial={{ opacity: 0, y: 60, rotateZ: 0 }}
            animate={{ opacity: 1, y: 0, rotateZ: 2 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
            style={{ perspective: "1000px" }}
          >
            {/* Glass card */}
            <div className="rounded-3xl border border-cream/10 bg-cream/[0.07] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl">
              {/* Card header */}
              <div className="mb-5 flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-300 to-pink-400 text-xs font-medium text-white ring-2 ring-rose-dark">
                    J
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-yellow-400 text-xs font-medium text-white ring-2 ring-rose-dark">
                    S
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-cream/60">Avatar Chat</p>
                  <p className="text-[10px] text-cream/25">Live conversation</p>
                </div>
                <div className="ml-auto">
                  <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                </div>
              </div>

              {/* Messages */}
              <div className="flex flex-col gap-3">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.side === "left" ? -16 : 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.0 + i * 0.25 }}
                    className={`flex flex-col ${msg.side === "right" ? "items-end" : "items-start"}`}
                  >
                    <span className="mb-1 text-[10px] text-cream/20">{msg.name}</span>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                        msg.side === "left"
                          ? "rounded-tl-sm bg-cream/[0.06] text-cream/65"
                          : "rounded-tr-sm bg-gradient-to-r from-pink-400/20 to-yellow-400/20 text-cream/65"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Typing indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.0 }}
                className="mt-4 flex items-center gap-1.5 text-[10px] text-cream/20"
              >
                <span className="flex gap-0.5">
                  <span className="h-1 w-1 rounded-full bg-cream/15 animate-bounce [animation-delay:0ms]" />
                  <span className="h-1 w-1 rounded-full bg-cream/15 animate-bounce [animation-delay:150ms]" />
                  <span className="h-1 w-1 rounded-full bg-cream/15 animate-bounce [animation-delay:300ms]" />
                </span>
                typing...
              </motion.div>
            </div>

            {/* Decorative floating elements */}
            <div className="absolute -top-5 -right-5 h-28 w-28 rounded-2xl bg-gradient-to-br from-yellow-300 to-yellow-400 opacity-25 blur-sm animate-float" />
            <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 to-pink-400 opacity-20 blur-sm animate-float-slow" />
          </motion.div>
        </motion.div>
      </div>

      {/* Avatar video cards - infinite marquee, same background */}
      <div className="relative overflow-hidden">
        {/* Edge fades - use transparent overlay matching section background */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#3a2530] to-transparent md:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#302828] to-transparent md:w-40" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.0 }}
          className="flex gap-1 py-0 md:gap-1"
          style={{
            animation: "marquee 80s linear infinite",
            width: "max-content",
            marginLeft: "-60px",
          }}
        >
          {[...avatarCards, ...avatarCards, ...avatarCards].map((card, i) => (
            <div
              key={`${card.id}-${i}`}
              className="relative h-[220px] w-[148px] shrink-0 overflow-hidden rounded-none md:h-[280px] md:w-[185px]"
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                poster={card.poster}
                className="h-full w-full object-cover"
              >
                <source src={card.video} type="video/mp4" />
              </video>

              {/* Dreamy overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Name tag */}
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-[13px] font-medium text-cream/90">{card.name}</p>
                <p className="text-[10px] text-cream/40">{card.age}세</p>
              </div>

            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
