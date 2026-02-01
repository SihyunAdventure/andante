export default function Footer() {
  return (
    <footer className="bg-dark">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-16 md:flex-row md:justify-between md:px-12">
        <a href="#" className="font-serif text-xl italic tracking-tight text-cream/90">
          andante
        </a>
        <div className="flex gap-8 text-[13px] text-cream/30">
          <a href="#" className="transition-colors hover:text-cream/60">
            Terms
          </a>
          <a href="#" className="transition-colors hover:text-cream/60">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-cream/60">
            Contact
          </a>
        </div>
        <p className="text-xs text-cream/20">
          &copy; 2025 Andante. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
