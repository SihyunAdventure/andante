"use client";

import { motion } from "framer-motion";
import { Users, Sparkles, Heart } from "lucide-react";

const rewards = [
  { invite: "친구와 함께", reward: "더 깊은 대화", icon: Users },
  { invite: "취향이 통하면", reward: "새로운 연결", icon: Sparkles },
  { invite: "느리게, 확실하게", reward: "진짜 만남", icon: Heart },
];

export default function InviteSection() {
  return (
    <section className="relative py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Dark rosé card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="noise-overlay relative overflow-hidden rounded-[2.5rem] bg-rose-dark px-8 py-16 md:px-20 md:py-24"
        >
          {/* Background blobs */}
          <div className="absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-yellow-400/10 blur-3xl animate-float-slow" />
          <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-pink-400/10 blur-3xl animate-float" />

          <div className="relative flex flex-col items-center text-center">
            {/* Headline */}
            <h2 className="font-serif text-5xl italic leading-tight tracking-tight text-cream md:text-7xl">
              Better{" "}
              <span className="text-yellow-300">Together.</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-cream/40 md:text-lg">
              혼자보다 함께일 때, 더 좋은 인연을 만나요.
            </p>

            {/* Reward cards */}
            <div className="mt-14 flex w-full max-w-2xl flex-col gap-3">
              {rewards.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className="group flex items-center gap-5 rounded-2xl border border-cream/[0.06] bg-cream/[0.04] px-6 py-5 backdrop-blur-sm transition-[border-color,background-color] duration-300 hover:border-yellow-300/15 hover:bg-cream/[0.07]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-300/10">
                    <r.icon className="h-5 w-5 text-yellow-300/90" strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <p className="text-[15px] font-medium tracking-tight text-cream/80">{r.reward}</p>
                    <p className="mt-0.5 text-xs text-cream/35">{r.invite}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.a
              href="/onboarding"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="group mt-12 inline-flex h-14 items-center gap-2.5 rounded-full bg-yellow-300 px-9 text-[15px] font-medium text-rose-dark transition-all hover:bg-yellow-200 hover:shadow-xl hover:shadow-yellow-400/20"
            >
              Begin Your Story
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
