import OrderForm from '@/components/OrderForm';
import CopyLink from '@/components/CopyLink';
import DeleteOrderButton from '@/components/DeleteOrderButton';
import PriceEditor from '@/components/PriceEditor';
import AppointmentInfoEditor from '@/components/AppointmentInfoEditor';
import TogglePaidButton from '@/components/TogglePaidButton';
import AdBanner from '@/components/AdBanner';
import { Calendar, Clock, ShoppingCart, Users, ArrowLeft, Wallet } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAppointmentBySlug } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function AppointmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const appointment = await getAppointmentBySlug(slug);

  if (!appointment) {
    notFound();
  }

  // Shopping List Aggregation
  const itemTotals = appointment.items.map(item => {
    const totalCount = appointment.orders.reduce((acc, order) => {
      const orderItem = order.items.find(oi => oi.itemId === item.id);
      return acc + (orderItem?.count || 0);
    }, 0);
    return {
      ...item,
      totalCount
    };
  });

  // Cost Calculations
  const totalCostCents = itemTotals.reduce((acc, item) => acc + (item.totalCount * item.unitPriceCents), 0);
  
  const paidCents = appointment.orders.reduce((acc, order) => {
    if (order.hasPaid === 0) return acc;
    const orderCost = order.items.reduce((sum, oi) => {
      const item = appointment.items.find(i => i.id === oi.itemId);
      return sum + (oi.count * (item?.unitPriceCents || 0));
    }, 0);
    return acc + orderCost;
  }, 0);

  const pendingCents = totalCostCents - paidCents;
  const pricesSet = appointment.items.some(i => i.unitPriceCents > 0);

  const formatEuro = (cents: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  };

  const dateObj = new Date(appointment.date);
  const formattedDate = dateObj.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedTime = dateObj.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" /> Zur Übersicht
        </Link>

        {/* Header Card */}
        <div className="bg-blue-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-4">{appointment.title}</h1>
              <div className="flex flex-wrap gap-4 text-blue-100 font-bold">
                <span className="flex items-center gap-2"><Calendar className="w-5 h-5" /> {formattedDate}</span>
                <span className="flex items-center gap-2"><Clock className="w-5 h-5" /> {formattedTime} Uhr</span>
              </div>
            </div>
            <CopyLink />
          </div>
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
              <div className="space-y-2">
                {itemTotals.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                    <span className="font-medium text-amber-800 text-sm">{item.name}</span>
                    <span className="font-bold text-lg">{item.totalCount}</span>
                  </div>
                ))}
                
                <div className="pt-4 border-t-2 border-dashed border-amber-200 mt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Gesamt:</span>
                    <span className="font-bold">{formatEuro(totalCostCents)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-green-600">
                    <span className="flex items-center gap-1"><Wallet className="w-3 h-3" /> Gezahlt:</span>
                    <span className="font-bold">{formatEuro(paidCents)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-amber-100">
                    <span className="font-bold text-gray-700 uppercase text-xs">Noch Offen:</span>
                    <span className="text-2xl font-black text-blue-900">
                      {pricesSet ? formatEuro(pendingCents) : 'Preise offen'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <AdBanner type="vertical" className="hidden lg:flex" />
            <AdBanner type="horizontal" className="lg:hidden" />
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
                  const orderCost = order.items.reduce((sum, oi) => {
                    const item = appointment.items.find(i => i.id === oi.itemId);
                    return sum + (oi.count * (item?.unitPriceCents || 0));
                  }, 0);

                  return (
                    <div key={order.id} className={`bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center hover:shadow-md transition-shadow ${order.hasPaid ? 'border-green-200 bg-green-50/20' : 'border-gray-100'}`}>
                      <div className="flex items-center gap-4">
                        <TogglePaidButton id={order.id} hasPaid={order.hasPaid === 1} slug={slug} disabled={!pricesSet} />
                        <div>
                          <span className={`font-bold text-lg ${order.hasPaid ? 'text-green-800' : 'text-gray-800'}`}>{order.userName}</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {order.items.map(oi => {
                              const item = appointment.items.find(i => i.id === oi.itemId);
                              if (!item || oi.count === 0) return null;
                              return (
                                <span key={oi.id} className="text-[10px] bg-slate-50 px-2 py-0.5 rounded text-slate-700 border border-slate-100">
                                  {item.name}: {oi.count}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-semibold ${order.hasPaid ? 'text-green-600' : 'text-gray-500'}`}>
                          {pricesSet ? formatEuro(orderCost) : 'Preise offen'}
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
