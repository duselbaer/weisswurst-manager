'use client';

import Link from 'next/link';
import { Calendar, Clock, Users, ChevronRight, Trash2 } from 'lucide-react';
import { deleteAppointment } from '@/app/actions';

interface Appointment {
  id: number;
  title: string;
  date: string;
  slug: string;
  isDone: number;
  orders: { id: number }[];
}

export default function AppointmentOverview({ 
  appointments, 
  serverNow,
  type = 'future'
}: { 
  appointments: Appointment[], 
  serverNow: string,
  type?: 'future' | 'past' | 'done'
}) {
  const now = new Date(serverNow);
  
  let filtered = appointments;
  if (type === 'future') {
    filtered = appointments.filter(apt => apt.isDone === 0 && new Date(apt.date) >= now);
  } else if (type === 'past') {
    filtered = appointments.filter(apt => apt.isDone === 0 && new Date(apt.date) < now);
  } else if (type === 'done') {
    filtered = appointments.filter(apt => apt.isDone === 1);
  }

  if (filtered.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl text-center border-2 border-dashed border-gray-200">
        <p className="text-gray-400 italic text-sm">
          {type === 'future' && 'Keine anstehenden Termine.'}
          {type === 'past' && 'Keine offenen Abrechnungen.'}
          {type === 'done' && 'Archiv ist leer.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {filtered.map((apt) => {
        const dateObj = new Date(apt.date);
        const formattedDate = dateObj.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const formattedTime = dateObj.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

        return (
          <div key={apt.id} className={`group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden flex flex-col ${apt.isDone ? 'opacity-75' : ''}`}>
            <div className="p-4 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-blue-900 group-hover:text-blue-700 transition-colors flex items-center gap-2">
                    {apt.title}
                    {apt.isDone === 1 && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">Erledigt</span>}
                  </h3>
                  <div className="mt-2 space-y-1 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-blue-500" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span>{formattedTime} Uhr</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 text-blue-500" />
                      <span>{apt.orders.length} Teilnehmer</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    if (confirm('Dieses Frühstück wirklich komplett löschen?')) {
                      await deleteAppointment(apt.id);
                    }
                  }}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <Link 
              href={`/f/${apt.slug}`}
              className={`py-2 px-4 text-sm font-bold flex justify-between items-center transition-all ${apt.isDone ? 'bg-gray-50 text-gray-600' : 'bg-blue-50 text-blue-900 group-hover:bg-blue-600 group-hover:text-white'}`}
            >
              Details & Abrechnung
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
