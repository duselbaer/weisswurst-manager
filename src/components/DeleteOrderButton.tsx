'use client';

import { deleteOrder } from '@/app/actions';
import { Trash2 } from 'lucide-react';

export default function DeleteOrderButton({ id, slug }: { id: number; slug: string }) {
  return (
    <button
      onClick={async () => {
        if (confirm('Möchtest du deine Bestellung wirklich löschen?')) {
          await deleteOrder(id, slug);
        }
      }}
      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
}
