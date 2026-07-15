import { createAppointment, getAllAppointments } from './actions';
import AppointmentOverview from '@/components/AppointmentOverview';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();
  const appointments = session?.user?.id ? await getAllAppointments(session.user.id) : [];
  const serverNow = new Date().toISOString();

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="text-center">
          <h1 className="text-5xl font-extrabold text-blue-900 mb-4">🥨 Weißwurst-Manager</h1>
          <p className="text-xl text-blue-700">Plane dein bayerisches Frühstück und teile den Link mit deinen Freunden!</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          <section className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-xl border-t-8 border-blue-600">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Neues Frühstück erstellen</h2>
            <form action={createAppointment} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="title" className="text-sm font-bold text-gray-700 uppercase tracking-wider">Was ist der Anlass?</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  placeholder="z.B. Weißwurst-Donnerstag"
                  required
                  className="border-2 p-3 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg text-black"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="date" className="text-sm font-bold text-gray-700 uppercase tracking-wider">Wann findet es statt?</label>
                <input
                  type="datetime-local"
                  name="date"
                  id="date"
                  required
                  className="border-2 p-3 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg text-black"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg text-xl"
              >
                Planen 🍻
              </button>
            </form>
          </section>

          <section className="lg:col-span-3 space-y-8">
            {!session ? (
              <div className="bg-white p-8 rounded-2xl shadow-xl border-l-8 border-blue-600">
                <h2 className="text-2xl font-black text-blue-900 mb-4">Servus! 🥨</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Mit dem <strong>Weißwurst-Manager</strong> planst du das perfekte bayerische Frühstück. 
                  Erstelle einen Termin, teile den Link und behalte den Überblick über alle Bestellungen.
                </p>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm italic mb-6">
                  Tipp: <a href="/register" className="font-bold underline">Registriere dich</a>, um deine Termine dauerhaft in einer Übersicht zu speichern!
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                    📅 Deine anstehenden Termine
                  </h2>
                  <AppointmentOverview appointments={appointments} serverNow={serverNow} type="future" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                    📝 Deine offenen Abrechnungen
                  </h2>
                  <AppointmentOverview appointments={appointments} serverNow={serverNow} type="past" />
                </div>

                <div className="pt-8 border-t border-gray-200">
                  <h2 className="text-xl font-bold text-gray-500 flex items-center gap-3 mb-4">
                    📦 Archiv (Erledigt)
                  </h2>
                  <AppointmentOverview appointments={appointments} serverNow={serverNow} type="done" />
                </div>
              </>
            )}
            
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-800">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span>💡</span> So funktioniert&apos;s:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Erstelle einen Termin</li>
                <li>Schicke den Link an deine Freunde</li>
                <li>Jeder trägt ein, was er essen möchte</li>
                <li>Du hast die perfekte Einkaufsliste!</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
