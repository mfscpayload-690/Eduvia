"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useThemeContext } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme, ready } = useThemeContext();

  if (!ready) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-[70px] items-center rounded-full border border-neutral-300 bg-neutral-200 px-1 shadow-inner transition-all duration-300 hover:border-blue-400 hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
      aria-label="Toggle theme"
    >
      <motion.div
        animate={{ x: isDark ? 34 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`flex h-8 w-8 items-center justify-center rounded-full shadow-lg ${
          isDark
            ? "bg-gradient-to-br from-blue-500 to-indigo-600"
            : "bg-gradient-to-br from-amber-400 to-orange-500"
        }`}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 0 : 180, scale: isDark ? 1 : 1.1 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? <Moon size={18} className="text-white" /> : <Sun size={18} className="text-white" />}
        </motion.div>
      </motion.div>
    </button>
  );
}
