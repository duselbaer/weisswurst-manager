'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyLink() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg border-2 border-blue-600 font-bold hover:bg-blue-50 transition-all shadow-sm"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Kopiert!' : 'Link kopieren & teilen'}
    </button>
  );
}
