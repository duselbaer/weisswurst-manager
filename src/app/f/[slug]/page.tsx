import { getAppointmentBySlug, toggleAppointmentStatus } from '@/app/actions';
import OrderForm from '@/components/OrderForm';
import CopyLink from '@/components/CopyLink';
import DeleteOrderButton from '@/components/DeleteOrderButton';
import PriceEditor from '@/components/PriceEditor';
import AppointmentInfoEditor from '@/components/AppointmentInfoEditor';
import TogglePaidButton from '@/components/TogglePaidButton';
import { Calendar, Clock, ShoppingCart, Users, ArrowLeft, CheckCircle2, RotateCcw, Wallet } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const appointment = await getAppointmentBySlug(slug);

  if (!appointment) {
    notFound();
  }

  const dateObj = new Date(appointment.date);
  const formattedDate = dateObj.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' });
  const formattedTime = dateObj.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  const isPast = new Date(appointment.date) < new Date();

  // Totals
  const totals = appointment.orders.reduce((acc, order) => ({
    brezen: acc.brezen + order.brezenCount,
    weisswurst: acc.weisswurst + order.weisswurstCount,
    wiener: acc.wiener + order.wienerCount,
    weissbier: acc.weissbier + order.weissbierCount,
  }), { brezen: 0, weisswurst: 0, wiener: 0, weissbier: 0 });

  const totalCostCents = 
    (totals.brezen * appointment.priceBreze) + 
    (totals.weisswurst * appointment.priceWeisswurst) + 
    (totals.wiener * appointment.priceWiener) +
    (totals.weissbier * appointment.priceWeissbier);

  const paidCents = appointment.orders.reduce((acc, order) => {
    if (order.hasPaid === 0) return acc;
    return acc + (
      (order.brezenCount * appointment.priceBreze) + 
      (order.weisswurstCount * appointment.priceWeisswurst) + 
      (order.wienerCount * appointment.priceWiener) +
      (order.weissbierCount * appointment.priceWeissbier)
    );
  }, 0);

  const pendingCents = totalCostCents - paidCents;

  const pricesSet = appointment.priceBreze > 0 || appointment.priceWeisswurst > 0 || appointment.priceWiener > 0 || appointment.priceWeissbier > 0;

  const formatEuro = (cents: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-blue-900 font-semibold hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück zur Startseite
          </Link>

          {appointment.isDone === 1 ? (
            <form action={async () => { 'use server'; await toggleAppointmentStatus(appointment.id, false, slug); }}>
              <button className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-200 font-bold hover:bg-amber-100 transition-all">
                <RotateCcw className="w-4 h-4" />
                Wieder eröffnen
              </button>
            </form>
          ) : (
            isPast && (
              <form action={async () => { 'use server'; await toggleAppointmentStatus(appointment.id, true, slug); }}>
                <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-all shadow-md">
                  <CheckCircle2 className="w-4 h-4" />
                  Als erledigt markieren
                </button>
              </form>
            )
          )}
        </div>

        {/* Header */}
        <div className={`text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden transition-colors ${appointment.isDone ? 'bg-slate-700' : 'bg-blue-900'}`}>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-black">{appointment.title}</h1>
                {appointment.isDone === 1 && (
                  <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm">
                    Abgeschlossen
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-blue-100 opacity-90">
                <span className="flex items-center gap-2"><Calendar className="w-5 h-5" /> {formattedDate}</span>
                <span className="flex items-center gap-2"><Clock className="w-5 h-5" /> {formattedTime} Uhr</span>
              </div>
            </div>
            <CopyLink />
          </div>
          {/* Decorative Pretzels */}
          <div className="absolute -right-10 -bottom-10 text-9xl opacity-10 pointer-events-none select-none">🥨</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar: Form & Summary */}
          <div className="lg:col-span-1 space-y-6">
            <OrderForm appointment={appointment} />
            
            <AppointmentInfoEditor appointment={appointment} />
            
            <PriceEditor appointment={appointment} />

            <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-amber-100">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-900">
                <ShoppingCart className="w-5 h-5" /> Einkaufsliste
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                  <span className="font-medium text-amber-800">🥨 Brezen</span>
                  <span className="font-bold text-xl">{totals.brezen}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                  <span className="font-medium text-amber-800">⚪ Weißwurst</span>
                  <span className="font-bold text-xl">{totals.weisswurst}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                  <span className="font-medium text-amber-800">🌭 Wiener</span>
                  <span className="font-bold text-xl">{totals.wiener}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                  <span className="font-medium text-amber-800">🍺 Weißbier</span>
                  <span className="font-bold text-xl">{totals.weissbier}</span>
                </div>
                <div className="pt-4 border-t-2 border-dashed border-amber-200 mt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Gesamt:</span>
                    <span className="font-bold text-gray-700">{formatEuro(totalCostCents)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-green-600">
                    <span className="flex items-center gap-1"><Wallet className="w-3 h-3" /> Gezahlt:</span>
                    <span className="font-bold">{formatEuro(paidCents)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-amber-100">
                    <span className="font-bold text-gray-700 uppercase text-xs">Noch Offen:</span>
                    <span className="text-2xl font-black text-blue-900">
                      {totalCostCents > 0 ? formatEuro(pendingCents) : 'Preise offen'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main: Participant List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-6 h-6" /> Wer ist dabei? ({appointment.orders.length})
            </h3>
            
            {appointment.orders.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-lg italic">Noch keine Bestellungen... sei der Erste!</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {appointment.orders.map((order) => {
                  return (
                    <div key={order.id} className={`bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center hover:shadow-md transition-shadow ${order.hasPaid ? 'border-green-200 bg-green-50/20' : 'border-gray-100'}`}>
                      <div className="flex items-center gap-4">
                        <TogglePaidButton id={order.id} hasPaid={order.hasPaid === 1} slug={slug} disabled={!pricesSet} />
                        <div>
                          <span className={`font-bold text-lg ${order.hasPaid ? 'text-green-800' : 'text-gray-800'}`}>{order.userName}</span>
                          <div className="flex gap-2 mt-1">
                            {order.brezenCount > 0 && <span className="text-xs bg-amber-50 px-2 py-0.5 rounded text-amber-700 border border-amber-100">🥨 {order.brezenCount}</span>}
                            {order.weisswurstCount > 0 && <span className="text-xs bg-slate-50 px-2 py-0.5 rounded text-slate-700 border border-slate-100">⚪ {order.weisswurstCount}</span>}
                            {order.wienerCount > 0 && <span className="text-xs bg-red-50 px-2 py-0.5 rounded text-red-700 border border-red-100">🌭 {order.wienerCount}</span>}
                            {order.weissbierCount > 0 && <span className="text-xs bg-yellow-50 px-2 py-0.5 rounded text-yellow-700 border border-yellow-100">🍺 {order.weissbierCount}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-semibold ${order.hasPaid ? 'text-green-600' : 'text-gray-500'}`}>
                          {((order.brezenCount * appointment.priceBreze) + 
                            (order.weisswurstCount * appointment.priceWeisswurst) + 
                            (order.wienerCount * appointment.priceWiener) +
                            (order.weissbierCount * appointment.priceWeissbier)) > 0 
                            ? formatEuro((order.brezenCount * appointment.priceBreze) + 
                                        (order.weisswurstCount * appointment.priceWeisswurst) + 
                                        (order.wienerCount * appointment.priceWiener) +
                                        (order.weissbierCount * appointment.priceWeissbier))
                            : 'Preise offen'}
                        </span>
                        <DeleteOrderButton id={order.id} slug={slug} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
