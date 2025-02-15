import CTA from "@/components/landing/CTA";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import React from "react";

export default function LandingPage() {
  return (
    <main>
      <Header />
      <Hero />
      <HowItWorks />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
