import Link from "next/link";
import { FaXTwitter, FaYoutube } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-secondary text-white py-8 px-6">
      <div className="container mx-auto flex flex-col items-center">
        <nav className="flex flex-col items-center">
          <div className="flex space-x-4 mb-6">
            <Link
              href="/pricing"
              className="text-white hover:text-primary active:text-white focus:text-white transition-colors"
            >
              Pricing
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://x.com/bhancock_ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-primary active:text-white focus:text-white transition-colors"
            >
              <FaXTwitter size={20} />
            </a>
            <a
              href="https://www.youtube.com/@bhancock_ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-primary active:text-white focus:text-white transition-colors"
            >
              <FaYoutube size={20} />
            </a>
          </div>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
