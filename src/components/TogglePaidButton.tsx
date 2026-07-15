'use client';

import { toggleOrderPaid } from '@/app/actions';
import { CheckCircle2, Circle } from 'lucide-react';

export default function TogglePaidButton({ 
  id, 
  hasPaid, 
  slug,
  disabled = false
}: { 
  id: number; 
  hasPaid: boolean; 
  slug: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={async () => {
        if (disabled) return;
        await toggleOrderPaid(id, !hasPaid, slug);
      }}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all flex items-center gap-2 font-bold text-xs ${
        disabled 
          ? 'text-gray-300 bg-gray-50 cursor-not-allowed opacity-50'
          : hasPaid 
            ? 'text-green-600 bg-green-50 hover:bg-green-100' 
            : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
      }`}
      title={disabled ? 'Zuerst Preise im Editor festlegen' : (hasPaid ? 'Als nicht gezahlt markieren' : 'Als gezahlt markieren')}
    >
      {hasPaid ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
      {hasPaid ? 'Gezahlt' : 'Offen'}
    </button>
  );
}
