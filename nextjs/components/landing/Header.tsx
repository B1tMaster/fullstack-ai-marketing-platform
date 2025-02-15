import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MobileHeader = () => (
  <header className="md:hidden flex justify-between items-center py-3 sm:py-4 px-4 sm:px-6 bg-white">
    <div className="text-secondary font-bold text-base sm:text-lg truncate max-w-[60%] sm:max-w-none">
      AI Marketing Platform
    </div>
    <nav className="flex items-center">
      <Link
        href="/pricing"
        className="mr-2 sm:mr-4 text-secondary text-sm sm:text-base"
      >
        Pricing
      </Link>
      <Link href="/projects">
        <Button
          variant="outline"
          className={cn(
            "bg-white text-primary border-primary",
            "text-xs sm:text-sm",
            "px-2 py-1.5 sm:px-4 sm:py-2",
            "min-h-[32px] sm:min-h-[40px]",
            "max-w-[64px] sm:max-w-none",
            "hover:bg-primary hover:text-white transition-colors duration-300",
            "focus:bg-primary focus:text-white focus:border-primary",
            "active:bg-primary active:text-white active:border-primary"
          )}
        >
          Login
        </Button>
      </Link>
    </nav>
  </header>
);

const DesktopHeader = () => (
  <header className="hidden md:flex justify-between items-center py-4 lg:py-6 px-6 lg:px-10 bg-white">
    <div className="text-secondary font-bold text-xl lg:text-2xl">
      AI Marketing Platform
    </div>
    <nav className="flex items-center">
      <Link
        href="/pricing"
        className="mr-4 lg:mr-6 text-secondary text-base lg:text-lg hover:text-primary transition-colors duration-300"
      >
        Pricing
      </Link>
      <Link href="/projects">
        <Button
          variant="outline"
          className={cn(
            "bg-white text-primary border-primary",
            "text-base lg:text-lg",
            "px-4 py-2 lg:px-6 lg:py-3",
            "hover:bg-primary hover:text-white transition-colors duration-300",
            "focus:bg-primary focus:text-white focus:border-primary",
            "active:bg-primary active:text-white active:border-primary"
          )}
        >
          Login
        </Button>
      </Link>
    </nav>
  </header>
);

const Header = () => {
  return (
    <>
      <MobileHeader />
      <DesktopHeader />
    </>
  );
};

export default Header;
