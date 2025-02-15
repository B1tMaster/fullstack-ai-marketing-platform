import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const MobileHero = () => (
  <div className="flex flex-col items-center py-6 px-6 overflow-hidden relative">
    <div className="absolute top-0 right-0 w-2/3 h-80 bg-primary opacity-10 rounded-bl-full z-0 transform translate-x-1/4 -translate-y-1/4" />

    <div className="relative z-10 mb-4">
      <Image
        src="/images/hero/heroimage.png"
        alt="AI Marketing Platform Interface"
        width={500}
        height={500}
        className="w-full h-auto max-w-md mx-auto"
        priority
      />
    </div>

    <div className="text-center z-10">
      <h1 className="text-3xl font-bold text-secondary mb-2">
        Save time by posting content...
      </h1>
      <p className="text-secondary mb-4 max-w-md mx-auto">
        Yes, you have heard it right! Do not waste time editing, just upload
        your text, audio and video content and watch AI turn it into
        ready-to-post social media publications.{" "}
      </p>
      <Link href="/projects">
        <Button className="bg-primary text-white px-6 py-3 text-lg">
          Start Now
        </Button>
      </Link>
    </div>
  </div>
);

const DesktopHero = () => (
  <div className="relative flex items-center overflow-hidden">
    {/* Background figures */}
    <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full opacity-10 transform -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-primary rounded-full opacity-10 transform -translate-y-1/2" />

    <div className="container mx-auto px-6 py-24 flex items-center relative z-10">
      <div className="w-1/2 pr-12 flex flex-col items-start">
        <h1 className="text-5xl font-bold text-secondary mb-6 leading-tight">
          Save time by posting content...
        </h1>
        <p className="text-xl text-secondary mb-8">
          Yes, you have heard it right! Do not waste time editing, just upload
          your text, audio and video content and watch AI turn it into
          ready-to-post social media publications.
        </p>
        <Link href="/projects">
          <Button className="bg-primary text-white px-10 py-5 text-2xl hover:bg-primary-dark transition-colors">
            Start Now
          </Button>
        </Link>
      </div>
      <div className="w-1/2 relative">
        <div className="relative z-10 p-8">
          <Image
            src="/images/hero/heroimage.png"
            alt="Marketing Automation Icons"
            width={512}
            height={512}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </div>
    {/* Custom SVG background with left-extended coverage */}
    <svg
      className="absolute top-0 right-0 h-full w-4/5 z-0"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path
        d="M-0 100 C 0 100, 20 100, 25 117 C 33 0, 60 0, 100 0 L 100 100 Z"
        fill="rgba(59, 130, 246, 0.1)"
      />
    </svg>
  </div>
);

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="md:hidden">
        <MobileHero />
      </div>
      <div className="hidden md:block">
        <DesktopHero />
      </div>
    </section>
  );
};

export default Hero;
