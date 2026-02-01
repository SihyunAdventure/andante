"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const textColor = scrolled ? "text-dark" : "text-cream";
  const textMuted = scrolled ? "text-dark/50" : "text-cream/50";
  const hoverText = scrolled ? "hover:text-dark" : "hover:text-cream";
  const lineColor = scrolled ? "bg-dark" : "bg-cream";

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-cream/80 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-12">
          {/* Logo */}
          <a href="#" className={`font-serif text-2xl italic tracking-tight transition-colors duration-500 ${textColor}`}>
            andante
          </a>

          {/* Desktop links */}
          <div className="hidden items-center gap-10 md:flex">
            <a
              href="#how-it-works"
              className={`text-[13px] tracking-wide transition-colors duration-500 ${textMuted} ${hoverText}`}
            >
              How it works
            </a>
            <a
              href="#value"
              className={`text-[13px] tracking-wide transition-colors duration-500 ${textMuted} ${hoverText}`}
            >
              About
            </a>
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/onboarding">
                <button
                  className={`inline-flex h-10 items-center rounded-full px-7 text-[13px] font-medium transition-all duration-500 ${
                    scrolled
                      ? "bg-dark text-cream hover:bg-dark-800"
                      : "bg-cream text-rose-dark hover:bg-white"
                  } hover:shadow-lg`}
                >
                  Get Started
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <a
                href="/onboarding"
                className={`inline-flex h-10 items-center rounded-full px-7 text-[13px] font-medium transition-all duration-500 ${
                  scrolled
                    ? "bg-dark text-cream hover:bg-dark-800"
                    : "bg-cream text-rose-dark hover:bg-white"
                } hover:shadow-lg mr-3`}
              >
                Get Started
              </a>
              <UserButton />
            </SignedIn>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full md:hidden"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-[5px]">
              <span
                className={`h-[1.5px] w-5 transition-all duration-500 ${lineColor} ${
                  mobileOpen ? "translate-y-[6.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-[1.5px] w-5 transition-all duration-500 ${lineColor} ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-[1.5px] w-5 transition-all duration-500 ${lineColor} ${
                  mobileOpen ? "-translate-y-[6.5px] -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-[72px] z-40 bg-cream/95 px-6 pb-8 pt-4 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-4">
              <a
                href="#how-it-works"
                onClick={() => setMobileOpen(false)}
                className="text-lg text-dark/70"
              >
                How it works
              </a>
              <a
                href="#value"
                onClick={() => setMobileOpen(false)}
                className="text-lg text-dark/70"
              >
                About
              </a>
              <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl="/onboarding">
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-dark px-6 text-base font-medium text-cream"
                  >
                    Get Started
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <a
                  href="/onboarding"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-dark px-6 text-base font-medium text-cream"
                >
                  Get Started
                </a>
              </SignedIn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
