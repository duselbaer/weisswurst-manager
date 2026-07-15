'use client';

import { updateAppointmentPrices, removeCustomItem } from '@/app/actions';
import { Appointment } from '@/db/schema';
import { Euro, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function PriceEditor({ appointment }: { appointment: Appointment }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-blue-100">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-lg font-bold text-gray-800"
      >
        <div className="flex items-center gap-2">
          <Euro className="w-5 h-5 text-blue-600" />
          Preise festlegen
        </div>
        <span className="text-blue-600 text-sm font-normal underline">
          {isOpen ? 'Schließen' : 'Bearbeiten'}
        </span>
      </button>

      {isOpen && (
        <form
          action={async (formData) => {
            await updateAppointmentPrices(formData);
            setIsOpen(false);
          }}
          className="mt-6 space-y-4"
        >
          <input type="hidden" name="slug" value={appointment.slug} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {appointment.items.map((item) => (
              <div key={item.id} className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-500 uppercase truncate pr-2">{item.name}</label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`"${item.name}" wirklich aus der Liste löschen?`)) {
                        await removeCustomItem(item.id, appointment.slug);
                      }
                    }}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    name={`price_${item.id}`}
                    defaultValue={(item.unitPriceCents / 100).toFixed(2)}
                    className="w-full border-2 p-2 pr-8 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-black text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">€</span>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4"
          >
            <Save className="w-5 h-5" />
            Preise Speichern
          </button>
        </form>
      )}
    </div>
  );
}
