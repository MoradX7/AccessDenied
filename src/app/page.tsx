import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import WhySection from "@/components/landing/WhySection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CTASection from "@/components/landing/CTASection";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <WhySection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <div className="border-t border-border py-8 text-center">
        <p className="text-sm text-muted-foreground">© AccessDenied</p>
      </div>
    </div>
  );
}
