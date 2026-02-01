"use client";

import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section id="cta" className="noise-overlay relative overflow-hidden py-28 md:py-44">
      {/* Background */}
      <div className="absolute inset-0 bg-cream" />
      <div className="absolute -bottom-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-pink-200/25 to-yellow-200/25 blur-3xl" />

      {/* Floating gradient cards */}
      <div className="absolute inset-0 overflow-hidden">
        {[
          { top: "8%", left: "5%", rotate: -15, w: 80, h: 100 },
          { top: "15%", right: "8%", rotate: 10, w: 100, h: 120 },
          { bottom: "10%", left: "10%", rotate: 8, w: 70, h: 90 },
          { bottom: "20%", right: "5%", rotate: -10, w: 90, h: 70 },
          { top: "40%", left: "2%", rotate: -5, w: 60, h: 80 },
        ].map((pos, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.12 }}
            className="absolute hidden md:block"
            style={{
              top: (pos as Record<string, unknown>).top as string | undefined,
              left: (pos as Record<string, unknown>).left as string | undefined,
              right: (pos as Record<string, unknown>).right as string | undefined,
              bottom: (pos as Record<string, unknown>).bottom as string | undefined,
              transform: `rotate(${pos.rotate}deg)`,
            }}
          >
            <div
              className="rounded-2xl bg-gradient-to-br from-pink-200/15 to-yellow-200/15 backdrop-blur-sm animate-float-slow"
              style={{ width: pos.w, height: pos.h }}
            />
          </motion.div>
        ))}
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          {/* Headline */}
          <h2 className="mb-4 font-serif text-5xl italic tracking-tight text-dark md:text-7xl lg:text-[88px]">
            Ready to Meet?
          </h2>
          <p className="mb-12 text-base text-dark/35 md:text-lg">
            아바타가 당신의 이야기를 시작할 준비가 됐어요.
          </p>

          {/* CTA button */}
          <a
            href="/onboarding"
            className="group inline-flex h-16 items-center gap-3 rounded-full bg-yellow-300 px-12 text-lg font-medium text-rose-dark shadow-xl shadow-yellow-400/20 transition-all hover:bg-yellow-200 hover:shadow-2xl hover:shadow-yellow-400/30"
          >
            Get Started
            <svg
              className="h-5 w-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <p className="mt-5 text-xs text-dark/25">
            무료로 시작하세요.
          </p>
        </motion.div>
      </div>

      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-dark/[0.06] to-transparent" />
    </section>
  );
}
