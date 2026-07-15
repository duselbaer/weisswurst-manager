'use client';

import { createAppointment } from '@/app/actions';
import { useRef } from 'react';

export default function AppointmentForm() {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createAppointment(formData);
        formRef.current?.reset();
      }}
      className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600"
    >
      <h2 className="text-xl font-bold mb-4 text-blue-800">Neues Weißwurstfrühstück planen</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-semibold text-gray-700">Anlass / Titel</label>
          <input
            type="text"
            name="title"
            id="title"
            placeholder="z.B. Team-Meeting"
            required
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="date" className="text-sm font-semibold text-gray-700">Datum & Uhrzeit</label>
          <input
            type="datetime-local"
            name="date"
            id="date"
            required
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="brezenCount" className="text-sm font-semibold text-gray-700">Anzahl Brezen (0,50 € / Stk)</label>
          <input
            type="number"
            name="brezenCount"
            id="brezenCount"
            min="0"
            defaultValue="0"
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="weisswurstCount" className="text-sm font-semibold text-gray-700">Anzahl Weißwürste (1,50 € / Stk)</label>
          <input
            type="number"
            name="weisswurstCount"
            id="weisswurstCount"
            min="0"
            defaultValue="0"
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="wienerCount" className="text-sm font-semibold text-gray-700">Anzahl Wiener (1,00 € / Stk)</label>
          <input
            type="number"
            name="wienerCount"
            id="wienerCount"
            min="0"
            defaultValue="0"
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors shadow-lg"
      >
        Termin Speichern 🥨
      </button>
    </form>
  );
}
