// app/template/[templateId]/not-found.tsx

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TemplateNotFound() {
  return (
    <div className="h-full p-4 sm:p-6 flex justify-center items-center">
      <div className="max-w-lg w-full text-center">
        <Image
          src="/images/404-error.png"
          alt="404 Error"
          width={300}
          height={300}
          className="mx-auto mb-2 w-48 h-48 sm:w-64 sm:h-64 md:w-[270px] md:h-[270px]"
        />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary mb-3 sm:mb-4">
          Oops! Template Not Found
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8">
          We couldn&apos;t find the template you&apos;re looking for. It may
          have been removed, renamed, or doesn&apos;t exist.
        </p>
        <Link href="/templates" passHref>
          <Button className="transition-colors text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
            Back to Templates
          </Button>
        </Link>
      </div>
    </div>
  );
}
