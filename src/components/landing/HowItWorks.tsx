"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Voice",
    desc: "음성으로 답하면 AI가 당신을 이해해요",
    detail: "질문에 음성으로 답하면 AI가 당신의 성격, 말투, 가치관을 깊이 이해합니다.",
    accent: "from-pink-400 to-pink-300",
  },
  {
    num: "02",
    title: "Avatar",
    desc: "사진을 올리면 나만의 아바타가 탄생해요",
    detail: "실제 모습과 닮은, 하지만 더 특별한 아바타가 만들어집니다.",
    accent: "from-yellow-400 to-yellow-300",
  },
  {
    num: "03",
    title: "Observe",
    desc: "아바타끼리 대화하는 모습을 지켜보세요",
    detail: "아바타가 먼저 대화하고, 마음에 들면 실제 만남으로 이어져요.",
    accent: "from-pink-400 to-yellow-400",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      type: "tween" as const,
      duration: 0.7,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-dark py-28 md:py-40">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-400/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-20 md:mb-28"
        >
          <h2 className="font-serif text-5xl italic leading-tight tracking-tight text-cream/90 md:text-7xl">
            How It Works
          </h2>
          <p className="mt-4 text-base text-cream/30">
            세 단계로 시작하는 새로운 만남
          </p>
        </motion.div>

        {/* Step cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-6 md:grid-cols-3 md:gap-8"
        >
          {steps.map((step) => (
            <motion.div
              key={step.num}
              variants={cardVariants}
              className="group relative overflow-hidden rounded-3xl border border-cream/[0.06] bg-cream/[0.03] p-8 transition-[border-color,background-color] duration-500 hover:border-cream/[0.12] hover:bg-cream/[0.06] md:p-10"
            >
              {/* Big step number */}
              <span className="block font-serif text-[120px] leading-none tracking-tighter text-yellow-300/20 md:text-[140px]">
                {step.num}
              </span>

              {/* Gradient accent dot */}
              <div className={`mb-6 h-1.5 w-12 rounded-full bg-gradient-to-r ${step.accent} opacity-60`} />

              {/* English title */}
              <h3 className="mb-3 font-serif text-3xl italic tracking-tight text-cream/85 md:text-4xl">
                {step.title}
              </h3>

              {/* Korean description */}
              <p className="mb-2 text-[15px] font-medium text-cream/50">
                {step.desc}
              </p>
              <p className="text-sm leading-relaxed text-cream/25">
                {step.detail}
              </p>

              {/* Hover gradient border glow */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.03]`} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
