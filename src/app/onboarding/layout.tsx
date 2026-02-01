import type { Metadata } from 'next';
import Link from 'next/link';
import { X } from 'lucide-react';

export const metadata: Metadata = {
  title: '온보딩 | Andante',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-cream border-b border-rose-dark/10">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="font-serif text-sm text-rose-dark">
            Andante
          </Link>

          {/* Close button */}
          <Link
            href="/"
            className="p-2 rounded-full hover:bg-rose-dark/5 transition-colors"
            aria-label="Close onboarding"
          >
            <X className="w-5 h-5 text-rose-dark" />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-20">
        <div className="max-w-lg mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
