"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Upload Media",
    icon: "/images/upload-4.png",
    description: "Upload your text, audio and video content to our platform.",
    desktopPoints: [
      "Support for various file formats",
      "Seamless upload process",
      "Efficient handling of large files",
      "Secure and encrypted data transfer",
    ],
  },
  {
    title: "Summarize",
    icon: "/images/summarize-5.png",
    description:
      "Our AI automatically generates a concise summary of your content.",
    desktopPoints: [
      "Advanced AI-powered content analysis",
      "Quick and accurate summarization",
      "Capture key points and themes",
      "Adaptable to different content types",
    ],
  },
  {
    title: "Prompts",
    icon: "/images/prompts-4.png",
    description:
      "Add up to 1,000,000 custom prompts to tailor the content exactly how you like.",
    desktopPoints: [
      "Up to 1,000,000 custom prompts",
      "Fine-tune AI output to match brand voice",
      "Target specific audiences effectively",
      "Achieve precise marketing goals",
    ],
  },
  {
    title: "Generate",
    icon: "/images/generate-4.png",
    description:
      "Generate marketing materials tailored to your content and audience.",
    desktopPoints: [
      "Create diverse marketing materials",
      "Tailored content for specific platforms",
      "Engagement-driven output",
      "Consistent brand messaging across channels",
    ],
  },
];

const ICON_ATTRIBUTIONS = [
  { author: "Iconjam", url: "https://www.flaticon.com/authors/iconjam" },
  {
    author: "Creative Sole",
    url: "https://www.flaticon.com/authors/creative-sole",
  },
  {
    author: "agus raharjo",
    url: "https://www.flaticon.com/authors/agus-raharjo",
  },
  { author: "Awicon", url: "https://www.flaticon.com/authors/awicon" },
  { author: "Vector Squad", url: "" },
];

// Desktop view component
const DesktopSteps: React.FC<{ activeStep: number }> = ({ activeStep }) => (
  <div className="relative hidden md:block">
    {/* Vertical timeline line */}
    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 transform -translate-x-1/2">
      {/* Active portion of the timeline */}
      <div
        className="absolute top-0 left-0 right-0 bg-primary transition-all duration-300 ease-out"
        style={{ height: `${((activeStep + 1) / STEPS.length) * 100}%` }}
      />
    </div>
    {STEPS.map((step, index) => (
      <div
        key={index}
        className="flex items-center justify-center mb-16 last:mb-0"
      >
        {/* Left content (text) */}
        <div className="w-[42%] pr-20 text-right">
          <h3 className="text-2xl font-semibold text-secondary mb-2">
            {step.title}
          </h3>
          <ul className="text-secondary text-base">
            {step.desktopPoints.map((point, i) => (
              <li key={i} className="flex items-center justify-end mb-1">
                <span className="mr-2">{point}</span>
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
              </li>
            ))}
          </ul>
        </div>
        {/* Center circle */}
        <div className="relative z-10 w-[16%] flex justify-center">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-base font-bold transition-all duration-300 ease-out",
              index <= activeStep
                ? "bg-primary text-white"
                : "bg-white text-primary border-2 border-primary"
            )}
          >
            {index + 1}
          </div>
        </div>
        {/* Right content (icon) */}
        <div className="w-[42%] pr-60">
          <Image
            src={step.icon}
            alt={step.title}
            width={128}
            height={128}
            className="mx-auto"
          />
        </div>
      </div>
    ))}
  </div>
);

// Updated Mobile view component
const MobileSteps: React.FC<{ activeStep: number }> = ({ activeStep }) => (
  <div className="relative md:hidden">
    {/* Vertical timeline line */}
    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 transform -translate-x-1/2">
      {/* Active portion of the timeline */}
      <div
        className="absolute top-0 left-0 right-0 bg-primary transition-all duration-300 ease-out"
        style={{ height: `${((activeStep + 1) / STEPS.length) * 100}%` }}
      />
    </div>
    {STEPS.map((step, index) => (
      <div
        key={index}
        className="flex items-center justify-center mb-16 last:mb-0"
      >
        {/* Left content (text) */}
        <div className="w-1/2 pr-4 text-right">
          <h3 className="text-lg font-semibold text-secondary mb-1">
            {step.title}
          </h3>
          <p className="text-secondary text-sm">{step.description}</p>
        </div>
        {/* Center circle */}
        <div className="relative z-10">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ease-out",
              index <= activeStep
                ? "bg-primary text-white"
                : "bg-white text-primary border-2 border-primary"
            )}
          >
            {index + 1}
          </div>
        </div>
        {/* Right content (icon) */}
        <div className="w-1/2 pl-4">
          <Image
            src={step.icon}
            alt={step.title}
            width={96}
            height={96}
            className="mx-auto"
          />
        </div>
      </div>
    ))}
  </div>
);

const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);

  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;

    const { top, height } = sectionRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const stepHeight = height / STEPS.length;

    const screenMiddle = windowHeight / 2;
    const newActiveStep = Math.min(
      STEPS.length - 1,
      Math.max(0, Math.floor((screenMiddle - top) / stepHeight))
    );

    setActiveStep(newActiveStep);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-secondary mb-16">
          How It Works
        </h2>
        <MobileSteps activeStep={activeStep} />
        <DesktopSteps activeStep={activeStep} />
      </div>

      <div className="sr-only">
        <h3>Icon Attributions</h3>
        {ICON_ATTRIBUTIONS.map((attr, index) => (
          <div key={index}>
            Icons made by{" "}
            <a href={attr.url} title={attr.author}>
              {attr.author}
            </a>{" "}
            from{" "}
            <a href="https://www.flaticon.com/" title="Flaticon">
              www.flaticon.com
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
