import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { User, LogOut, LogIn } from 'lucide-react';

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-black text-blue-900 flex items-center gap-2">
          <span>🥨</span>
          <span className="hidden sm:inline">Weißwurst-Manager</span>
        </Link>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full">
                <User className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">{session.user.name || session.user.email}</span>
              </div>
              <form action={async () => {
                'use server';
                await signOut();
              }}>
                <button className="text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1 text-sm font-bold">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Abmelden</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-blue-600 text-sm font-bold transition-colors flex items-center gap-1"
              >
                <LogIn className="w-4 h-4" />
                Anmelden
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all shadow-sm"
              >
                Registrieren
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
