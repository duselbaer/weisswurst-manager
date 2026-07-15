'use client';

import { updateAppointmentPrices } from '@/app/actions';
import { Appointment } from '@/db/schema';
import { Euro, Save } from 'lucide-react';
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
          <input type="hidden" name="id" value={appointment.id} />
          <input type="hidden" name="slug" value={appointment.slug} />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Breze</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  name="priceBreze"
                  defaultValue={(appointment.priceBreze / 100).toFixed(2)}
                  className="w-full border-2 p-2 pr-8 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-black text-right"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">€</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Weißwurst</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  name="priceWeisswurst"
                  defaultValue={(appointment.priceWeisswurst / 100).toFixed(2)}
                  className="w-full border-2 p-2 pr-8 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-black text-right"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">€</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Wiener</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  name="priceWiener"
                  defaultValue={(appointment.priceWiener / 100).toFixed(2)}
                  className="w-full border-2 p-2 pr-8 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-black text-right"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">€</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Weißbier</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  name="priceWeissbier"
                  defaultValue={(appointment.priceWeissbier / 100).toFixed(2)}
                  className="w-full border-2 p-2 pr-8 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-black text-right"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">€</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Preise Speichern
          </button>
        </form>
      )}
    </div>
  );
}
