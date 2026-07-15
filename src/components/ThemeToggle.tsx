'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-2 w-9 h-9" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-yellow-400 hover:ring-2 hover:ring-blue-400 transition-all outline-none"
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5 text-blue-900" />
      )}
    </button>
  );
}
