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
    if (!order.hasPaid) return acc;
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
    <main className="min-h-screen py-10 px-4 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:underline mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Zur Übersicht
        </Link>

        {/* Header Card */}
        <div className="bg-blue-900 dark:bg-blue-950 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden transition-colors border-2 border-transparent dark:border-blue-900/30">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-4">{appointment.title}</h1>
              <div className="flex flex-wrap gap-4 text-blue-100 dark:text-blue-200 font-bold">
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

            <div className="bg-card p-6 rounded-2xl shadow-md border-2 border-amber-100 dark:border-amber-900/30 transition-colors">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-900 dark:text-amber-400">
                <ShoppingCart className="w-5 h-5" /> Einkaufsliste
              </h3>
              <div className="space-y-2">
                {itemTotals.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg transition-colors">
                    <span className="font-medium text-amber-800 dark:text-amber-200 text-sm">{item.name}</span>
                    <span className="font-bold text-lg text-foreground">{item.totalCount}</span>
                  </div>
                ))}
                
                <div className="pt-4 border-t-2 border-dashed border-amber-200 dark:border-amber-900/30 mt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>Gesamt:</span>
                    <span className="font-bold text-foreground">{formatEuro(totalCostCents)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1"><Wallet className="w-3 h-3" /> Gezahlt:</span>
                    <span className="font-bold">{formatEuro(paidCents)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-amber-100 dark:border-amber-900/20">
                    <span className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">Noch Offen:</span>
                    <span className="text-2xl font-black text-blue-900 dark:text-blue-400">
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
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6" /> Wer ist dabei? ({appointment.orders.length})
            </h3>
            
            {appointment.orders.length === 0 ? (
              <div className="bg-card p-12 rounded-2xl text-center border-2 border-dashed border-border transition-colors">
                <p className="text-gray-400 dark:text-gray-500 text-lg italic">Noch keine Bestellungen... sei der Erste!</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {appointment.orders.map((order) => {
                  const orderCost = order.items.reduce((sum, oi) => {
                    const item = appointment.items.find(i => i.id === oi.itemId);
                    return sum + (oi.count * (item?.unitPriceCents || 0));
                  }, 0);

                  return (
                    <div key={order.id} className={`bg-card p-4 rounded-xl shadow-sm border flex justify-between items-center hover:shadow-md transition-all ${order.hasPaid ? 'border-green-200 dark:border-green-900/30 bg-green-50/20 dark:bg-green-900/10' : 'border-border'}`}>
                      <div className="flex items-center gap-4">
                        <TogglePaidButton id={order.id} hasPaid={order.hasPaid} slug={slug} disabled={!pricesSet} />
                        <div>
                          <span className={`font-bold text-lg ${order.hasPaid ? 'text-green-800 dark:text-green-400' : 'text-foreground'}`}>{order.userName}</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {order.items.map(oi => {
                              const item = appointment.items.find(i => i.id === oi.itemId);
                              if (!item || oi.count === 0) return null;
                              return (
                                <span key={oi.id} className="text-[10px] bg-background px-2 py-0.5 rounded text-foreground/70 border border-border">
                                  {item.name}: {oi.count}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-semibold ${order.hasPaid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
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
