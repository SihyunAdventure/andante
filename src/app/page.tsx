import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import VoicePreview from "@/components/landing/VoicePreview";
import HowItWorks from "@/components/landing/HowItWorks";
import ValueProposition from "@/components/landing/ValueProposition";
import InviteSection from "@/components/landing/InviteSection";
import CTASection from "@/components/landing/CTASection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <VoicePreview />
        <HowItWorks />
        <ValueProposition />
        <InviteSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
