import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ProblemSection } from "@/components/problem-section"
import { CapabilitiesSection } from "@/components/capabilities-section"
import { ComparisonSection } from "@/components/comparison-section"
import { IntegrationsSection } from "@/components/integrations-section"
import { PackagesSection } from "@/components/packages-section"
import { DiscoverySection } from "@/components/discovery-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <CapabilitiesSection />
      <ComparisonSection />
      <IntegrationsSection />
      <PackagesSection />
      <DiscoverySection />
      <Footer />
    </main>
  )
}
