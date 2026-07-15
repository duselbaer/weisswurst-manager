import React from 'react';
import { Megaphone } from 'lucide-react';

interface AdBannerProps {
  type?: 'horizontal' | 'vertical' | 'small';
  className?: string;
}

export default function AdBanner({ type = 'horizontal', className = '' }: AdBannerProps) {
  const styles = {
    horizontal: "w-full h-24 sm:h-32",
    vertical: "w-full h-64",
    small: "w-full h-20"
  };

  return (
    <div className={`bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-4 text-slate-400 dark:text-slate-500 group hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all ${styles[type]} ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <Megaphone className="w-5 h-5 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Sponsoring / Werbung</span>
      </div>
      <p className="text-xs text-center font-medium max-w-[200px] leading-tight group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
        Hier könnte Ihre Werbung stehen – <br className="hidden sm:block" />
        Kontaktieren Sie uns für ein Weißwurst-Sponsoring!
      </p>
    </div>
  );
}
