'use client';

import { updateAppointmentInfo } from '@/app/actions';
import { Appointment } from '@/db/schema';
import { Settings, Save } from 'lucide-react';
import { useState } from 'react';

export default function AppointmentInfoEditor({ appointment }: { appointment: Appointment }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-blue-100">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-lg font-bold text-gray-800"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Termin bearbeiten
        </div>
        <span className="text-blue-600 text-sm font-normal underline">
          {isOpen ? 'Schließen' : 'Bearbeiten'}
        </span>
      </button>

      {isOpen && (
        <form
          action={async (formData) => {
            await updateAppointmentInfo(formData);
            setIsOpen(false);
          }}
          className="mt-6 space-y-4"
        >
          <input type="hidden" name="id" value={appointment.id} />
          <input type="hidden" name="slug" value={appointment.slug} />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Anlass / Titel</label>
            <input
              type="text"
              name="title"
              defaultValue={appointment.title}
              required
              className="border-2 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Datum & Uhrzeit</label>
            <input
              type="datetime-local"
              name="date"
              defaultValue={appointment.date}
              required
              className="border-2 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Änderungen speichern
          </button>
        </form>
      )}
    </div>
  );
}
