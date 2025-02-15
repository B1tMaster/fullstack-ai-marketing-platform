// nextjs/app/pricing/page.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const FEATURES = [
  "Unlimited projects",
  "Unlimited templates",
  "Unlimited storage",
];

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-background p-4 overflow-hidden">
      {/* Background figures */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 max-w-64 max-h-64 bg-primary rounded-full opacity-10 transform -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-2/3 h-2/3 max-w-96 max-h-96 bg-primary rounded-full opacity-10 transform translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/4 w-1/3 h-1/3 max-w-48 max-h-48 bg-primary rounded-full opacity-10 transform -translate-y-1/2" />

      <div className="flex justify-center items-center min-h-screen relative z-10">
        <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl shadow-xl border-primary">
          <div className="max-w-xl mx-auto">
            <CardHeader className="p-6 sm:p-8 pb-2 sm:pb-4 text-center">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary mb-2">
                AI Marketer Pro
              </CardTitle>
              <CardDescription className="text-base sm:text-lg md:text-xl text-secondary">
                For efficient content creators who value their time:
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-2 sm:pt-4">
              <div className="text-center">
                <Image
                  src="/images/hero/heroimage.png"
                  alt="AI Marketer Pro"
                  width={300}
                  height={225}
                  className="mx-auto mb-4 sm:mb-6 w-3/4 sm:w-4/5 md:w-full max-w-[250px]"
                />
                <div className="mt-4 sm:mt-6">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
                    $14.99
                  </span>
                  <span className="text-xl sm:text-2xl text-secondary ml-2">
                    / month
                  </span>
                </div>
              </div>
              <Link href="/projects" passHref className="block mt-6 sm:mt-8">
                <Button className="w-full bg-primary text-white hover:bg-primary-dark transition-colors text-lg sm:text-xl py-6 sm:py-8">
                  Purchase Now
                </Button>
              </Link>
              <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-x-4 gap-y-2 max-w-xl mx-auto">
                {FEATURES.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center text-secondary text-sm sm:text-base"
                  >
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
