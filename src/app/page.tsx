import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import SearchSection from "@/components/landing/SearchSection";
import StatsSection from "@/components/landing/StatsSection";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import FeaturedDoctors from "@/components/landing/FeaturedDoctors";
import Testimonials from "@/components/landing/Testimonials";
import FaqSection from "@/components/landing/FaqSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <Hero />
      <SearchSection />
      <StatsSection />
      <WhyChooseUs />
      <FeaturedDoctors />
      <Testimonials />
      <FaqSection />
      <Footer />
    </div>
  );
}