import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Box, Star, LayoutTemplate, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubscriptionMessage() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 z-10 p-4 sm:p-6 md:p-8">
      <Card className="p-4 sm:p-6 w-full max-w-[90%] sm:max-w-md border-2 border-main bg-[#f0f8ff] rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-main opacity-10 rounded-full -mr-8 sm:-mr-10 md:-mr-12 -mt-8 sm:-mt-10 md:-mt-12"></div>
        <div className="absolute bottom-0 left-0 w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-main opacity-10 rounded-full -ml-6 sm:-ml-7 md:-ml-8 -mb-6 sm:-mb-7 md:-mb-8"></div>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center text-main flex items-center justify-center space-x-2">
            <Sparkles
              className="w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6 text-main"
              strokeWidth={3}
            />
            <span className="whitespace-nowrap">Unlock Premium Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 sm:space-y-6 relative z-10">
          <p className="text-center text-gray-700 text-sm sm:text-base">
            Elevate your projects with our AI-powered platform.
          </p>
          <ul className="space-y-2 sm:space-y-3 w-full">
            {[
              { icon: Star, text: "Unlimited Projects" },
              { icon: LayoutTemplate, text: "Unlimited Templates" },
              { icon: Box, text: "Unlimited Storage" },
            ].map((feature, index) => (
              <li
                key={index}
                className="flex items-center space-x-2 sm:space-x-3 bg-white/30 p-1.5 sm:p-2 rounded-lg transition-all hover:bg-white/70"
              >
                <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-main" />
                <span className="text-xs sm:text-sm font-medium">
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
          <Button
            asChild
            className="w-full bg-main text-white hover:bg-main/90 transform transition-all duration-300 shadow-md text-sm sm:text-base py-2 sm:py-3"
          >
            <Link href="/settings">Subscribe Now</Link>
          </Button>
          <p className="text-[10px] sm:text-xs text-gray-500 text-center">
            30-day money-back guarantee. No long-term commitments.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
