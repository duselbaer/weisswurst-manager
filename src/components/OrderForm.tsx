'use client';

import { addOrder, addCustomItem } from '@/app/actions';
import { Appointment } from '@/db/types';
import { useRef, useState } from 'react';
import { Plus } from 'lucide-react';

export default function OrderForm({ appointment }: { appointment: Appointment }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [newItemName, setNewItemName] = useState('');

  const formatPrice = (priceCents: number) => {
    if (priceCents === 0) return 'Preis offen';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(priceCents / 100);
  };

  const handleAddCustom = async () => {
    if (!newItemName.trim()) return;
    await addCustomItem(appointment.id, newItemName, appointment.slug);
    setNewItemName('');
  };

  return (
    <div className="bg-card p-6 rounded-xl shadow-md border-2 border-blue-100 dark:border-blue-900/30 space-y-6 transition-colors">
      <h3 className="text-xl font-bold text-foreground">Ich bin dabei! 🥨</h3>
      
      <form
        ref={formRef}
        action={async (formData) => {
          await addOrder(formData);
          formRef.current?.reset();
        }}
        className="space-y-6"
      >
        <input type="hidden" name="appointmentId" value={appointment.id} />
        <input type="hidden" name="slug" value={appointment.slug} />

        <div className="flex flex-col gap-1">
          <label htmlFor="userName" className="text-sm font-semibold text-gray-600 dark:text-gray-400">Dein Name</label>
          <input
            type="text"
            name="userName"
            id="userName"
            placeholder="z.B. Maxi"
            required
            className="border border-border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-foreground bg-background transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
          {appointment.items.map((item) => (
            <div key={item.id} className="flex flex-col gap-1 p-2 bg-background/50 rounded-lg border border-border transition-colors">
              <label htmlFor={`item_${item.id}`} className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase truncate">
                {item.name} ({formatPrice(item.unitPriceCents)})
              </label>
              <input
                type="number"
                name={`item_${item.id}`}
                id={`item_${item.id}`}
                min="0"
                defaultValue="0"
                className="border border-border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-foreground bg-background text-right transition-colors"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md mt-2"
        >
          Zur Liste hinzufügen
        </button>
      </form>

      <div className="pt-4 border-t border-dashed border-gray-200 dark:border-slate-800">
        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 block">Fehlt etwas? (z.B. Senf, Obazda...)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Neuer Artikel..."
            className="flex-1 border dark:border-slate-800 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white dark:bg-slate-800 transition-colors"
          />
          <button
            onClick={handleAddCustom}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-2 rounded-lg transition-colors"
            title="Artikel hinzufügen"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
