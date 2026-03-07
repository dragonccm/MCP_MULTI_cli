import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { HeroSection } from "./features/hero/HeroSection";
import { AboutSection } from "./features/about/AboutSection";
import { ServicesSection } from "./features/services/ServicesSection";
import { PortfolioSection } from "./features/portfolio/PortfolioSection";
import { PricingSection } from "./features/pricing/PricingSection";
import { ContactSection } from "./features/contact/ContactSection";

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <AboutSection />
          <ServicesSection />
          <PortfolioSection />
          <PricingSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
