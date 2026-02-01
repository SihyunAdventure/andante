"use client";

import { motion } from "framer-motion";

const values = [
  {
    num: "01",
    title: "진짜 성격으로 매칭",
    desc: "외모가 아닌 대화 스타일, 가치관, 유머 감각을 기반으로 매칭해요.",
    gradient: "from-pink-200 to-pink-300",
  },
  {
    num: "02",
    title: "부담 없는 시작",
    desc: "아바타가 먼저 대화하니까, 내 정보 노출 없이 편안하게 시작할 수 있어요.",
    gradient: "from-yellow-200 to-yellow-300",
  },
  {
    num: "03",
    title: "당신이 결정해요",
    desc: "AI가 결정하지 않아요. 대화 내용을 보고 만남 여부를 직접 판단하세요.",
    gradient: "from-pink-200 to-yellow-200",
  },
];

const lineVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.15,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

export default function ValueProposition() {
  return (
    <section id="value" className="relative overflow-hidden py-28 md:py-40">
      {/* Soft background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-pink-50/20 to-cream" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        {/* Big statement - line by line reveal */}
        <div className="mb-20 md:mb-28">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="max-w-3xl font-serif text-5xl italic leading-[1.15] tracking-tight text-dark md:text-7xl lg:text-[88px]"
          >
            <motion.span variants={lineVariants} custom={0} className="block">
              No More Swiping.
            </motion.span>
            <motion.span
              variants={lineVariants}
              custom={1}
              className="block bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent"
            >
              Start with
            </motion.span>
            <motion.span variants={lineVariants} custom={2} className="block bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
              Conversation.
            </motion.span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-base text-dark/35 md:text-lg"
          >
            스와이프 말고, 대화로 시작하세요.
          </motion.p>
        </div>

        {/* Value cards */}
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {values.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group relative overflow-hidden rounded-3xl border border-dark/[0.04] bg-white/50 p-8 backdrop-blur-sm transition-[transform,border-color,background-color,box-shadow] duration-500 hover:scale-[1.02] hover:border-pink-200/50 hover:bg-white/70 hover:shadow-xl hover:shadow-pink-100/20 md:p-10"
            >
              {/* Large number */}
              <span className="mb-6 block font-serif text-6xl italic bg-gradient-to-b from-pink-300 to-yellow-300 bg-clip-text text-transparent opacity-60">
                {v.num}
              </span>

              {/* Gradient bar */}
              <div className={`mb-6 h-1 w-10 rounded-full bg-gradient-to-r ${v.gradient} opacity-50 transition-all duration-500 group-hover:w-16 group-hover:opacity-80`} />

              <h3 className="mb-3 text-xl font-semibold tracking-tight text-dark">
                {v.title}
              </h3>
              <p className="text-sm leading-relaxed text-dark/35">{v.desc}</p>

              {/* Hover gradient overlay */}
              <div className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br ${v.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.04]`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
