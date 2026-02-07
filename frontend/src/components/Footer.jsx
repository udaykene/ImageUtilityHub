import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 py-8 sm:py-12 bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="size-8 bg-primary rounded-md flex items-center justify-center text-white">
              <Sparkles className="size-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">FormatFlow</h2>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="/api" className="hover:text-primary transition-colors">
              API Docs
            </Link>
            <Link to="/support" className="hover:text-primary transition-colors">
              Support
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex gap-4">
            <a
              href="#"
              className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="size-5" />
            </a>
            <a
              href="#"
              className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="GitHub"
            >
              <Github className="size-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 sm:mt-12 text-center text-slate-600 dark:text-slate-500 text-xs sm:text-sm">
          © {currentYear} FormatFlow. All rights reserved. No cookies, no tracking.
        </div>
      </div>
    </footer>
  );
}