"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const voices = [
  { id: "01", name: "준혁", age: 32, audio: "/audios/김준혁_자기소개.mp3", video: "/videos/01_kim_junhyuk.mp4", poster: "/images/personas/01_kim_junhyuk.png" },
  { id: "02", name: "서연", age: 29, audio: "/audios/이서연_자기소개.mp3", video: "/videos/02_lee_seoyeon.mp4", poster: "/images/personas/02_lee_seoyeon.png" },
  { id: "03", name: "민재", age: 35, audio: "/audios/박민재_자기소개.mp3", video: "/videos/03_park_minjae.mp4", poster: "/images/personas/03_park_minjae.png" },
  { id: "04", name: "유진", age: 27, audio: "/audios/최유진_자기소개.mp3", video: "/videos/04_choi_yujin.mp4", poster: "/images/personas/04_choi_yujin.png" },
  { id: "05", name: "하윤", age: 31, audio: "/audios/정하윤_자기소개.mp3", video: "/videos/05_jung_hayun.mp4", poster: "/images/personas/05_jung_hayun.png" },
];

export default function VoicePreview() {
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = (id: string, src: string) => {
    if (playing === id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(src);
    audio.onended = () => setPlaying(null);
    audio.play();
    audioRef.current = audio;
    setPlaying(id);
  };

  return (
    <section className="relative bg-dark py-28 md:py-40">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cream/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-16 md:mb-20"
        >
          <h2 className="font-serif text-5xl italic leading-tight tracking-tight text-cream/90 md:text-7xl">
            Hear Their <span className="text-yellow-300">Voice.</span>
          </h2>
          <p className="mt-4 text-base text-cream/30">
            아바타의 목소리를 미리 들어보세요
          </p>
        </motion.div>

        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide md:grid md:grid-cols-5 md:gap-5 md:overflow-visible md:snap-none md:pb-0">
          {voices.map((v, i) => (
            <motion.button
              key={v.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              onClick={() => toggle(v.id, v.audio)}
              className="group relative w-[160px] shrink-0 snap-center overflow-hidden rounded-2xl border border-cream/[0.06] bg-cream/[0.03] text-left transition-[border-color,background-color] duration-300 hover:border-cream/[0.12] hover:bg-cream/[0.06] md:w-auto"
            >
              {/* Video */}
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={v.poster}
                  className="h-full w-full object-cover"
                >
                  <source src={v.video} type="video/mp4" />
                </video>
                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-dark/70 to-transparent" />
              </div>

              {/* Info + play button */}
              <div className="flex items-center gap-2 px-3 py-2.5 md:px-4 md:py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-cream/80 md:text-sm">{v.name}</p>
                  <p className="text-[10px] text-cream/30 md:text-[11px]">{v.age}세 · 자기소개</p>
                </div>
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-200 md:h-8 md:w-8 ${playing === v.id ? "bg-yellow-300" : "bg-cream/10 group-hover:bg-cream/15"}`}>
                  {playing === v.id ? (
                    <Pause className="h-3 w-3 text-dark md:h-3.5 md:w-3.5" fill="currentColor" />
                  ) : (
                    <Play className="h-3 w-3 translate-x-[1px] text-cream/60 md:h-3.5 md:w-3.5" fill="currentColor" />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
