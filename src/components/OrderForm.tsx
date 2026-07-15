'use client';

import { addOrder } from '@/app/actions';
import { Appointment } from '@/db/schema';
import { useRef } from 'react';

export default function OrderForm({ appointment }: { appointment: Appointment }) {
  const formRef = useRef<HTMLFormElement>(null);

  const formatPrice = (priceCents: number) => {
    if (priceCents === 0) return 'Preis offen';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(priceCents / 100);
  };

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addOrder(formData);
        formRef.current?.reset();
      }}
      className="bg-white p-6 rounded-xl shadow-md border-2 border-blue-100"
    >
      <h3 className="text-xl font-bold mb-4 text-gray-800">Ich bin dabei! 🥨</h3>
      
      <input type="hidden" name="appointmentId" value={appointment.id} />
      <input type="hidden" name="slug" value={appointment.slug} />

      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="userName" className="text-sm font-semibold text-gray-600">Dein Name</label>
          <input
            type="text"
            name="userName"
            id="userName"
            placeholder="z.B. Maxi"
            required
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="brezenCount" className="text-[10px] font-bold text-gray-500 uppercase">Brezen ({formatPrice(appointment.priceBreze)})</label>
            <input
              type="number"
              name="brezenCount"
              id="brezenCount"
              min="0"
              defaultValue="0"
              className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-right"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="weisswurstCount" className="text-[10px] font-bold text-gray-500 uppercase">Weißwurst ({formatPrice(appointment.priceWeisswurst)})</label>
            <input
              type="number"
              name="weisswurstCount"
              id="weisswurstCount"
              min="0"
              defaultValue="0"
              className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-right"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="wienerCount" className="text-[10px] font-bold text-gray-500 uppercase">Wiener ({formatPrice(appointment.priceWiener)})</label>
            <input
              type="number"
              name="wienerCount"
              id="wienerCount"
              min="0"
              defaultValue="0"
              className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-right"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="weissbierCount" className="text-[10px] font-bold text-gray-500 uppercase">Weißbier ({formatPrice(appointment.priceWeissbier)})</label>
            <input
              type="number"
              name="weissbierCount"
              id="weissbierCount"
              min="0"
              defaultValue="0"
              className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-right"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md mt-2"
        >
          Zur Liste hinzufügen
        </button>
      </div>
    </form>
  );
}
