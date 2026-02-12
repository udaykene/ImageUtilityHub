import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Sparkles, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Set dark mode as default
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { path: '/compress', label: 'Compress' },
    { path: '/convert', label: 'Convert' },
    { path: '/resize', label: 'Resize' },
    { path: '/extract', label: 'Extract' },
    { path: '/images-to-pdf', label: 'To PDF' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 w-full border-b border-white/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="size-8 sm:size-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20"
          >
            <Sparkles className="size-4 sm:size-5" />
          </motion.div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 dark:from-white to-primary">
            FormatFlow
          </h2>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex! items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'text-primary'
                  : 'text-slate-600 dark:text-slate-300 hover:text-primary'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Contact/Feedback Link */}
          <motion.a
            href="mailto:support@formatflow.com"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:flex! items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            <Mail className="size-4" />
            <span>Contact</span>
          </motion.a>
        </div>
      </div>
    </motion.header>
  );
}