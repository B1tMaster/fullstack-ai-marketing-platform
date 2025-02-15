// File: /components/CTA.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CTA = () => {
  return (
    <section className="py-12 px-6 bg-primary text-white text-center">
      <h2 className="text-3xl font-bold mb-4">
        Yes! I want to start marketing with AI now!
      </h2>
      <Link href="/projects">
        <Button
          variant="outline"
          className="bg-white text-primary hover:bg-background"
        >
          Start Now
        </Button>
      </Link>
    </section>
  );
};

export default CTA;
