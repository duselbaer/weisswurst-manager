'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError('Anmeldung fehlgeschlagen. Bitte Daten prüfen.');
    } else {
      window.location.href = '/';
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4 transition-colors">
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border-t-8 border-blue-600 transition-colors">
        <h1 className="text-3xl font-black text-blue-900 dark:text-blue-400 mb-2 text-center">Anmelden 🍻</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Logge dich ein, um deine Termine zu sehen.</p>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm font-bold text-center border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">E-Mail</label>
            <input
              type="email"
              name="email"
              required
              className="border-2 dark:border-slate-800 p-3 rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-500 outline-none text-black dark:text-white dark:bg-slate-800 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Passwort</label>
            <input
              type="password"
              name="password"
              required
              className="border-2 dark:border-slate-800 p-3 rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-500 outline-none text-black dark:text-white dark:bg-slate-800 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-xl transition-all shadow-lg text-lg mt-4"
          >
            Einloggen 🥨
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          Noch kein Konto?{' '}
          <Link href="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </main>
  );
}
