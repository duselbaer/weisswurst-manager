import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { User, LogOut, LogIn } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-black text-blue-900 dark:text-blue-400 flex items-center gap-2">
          <span>🥨</span>
          <span className="hidden sm:inline">Weißwurst-Manager</span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session?.user ? (
            <>
              <div className="flex items-center gap-2 text-sm font-bold text-card-foreground bg-background px-3 py-1.5 rounded-full">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">{session.user.name || session.user.email}</span>
              </div>
              <form action={async () => {
                'use server';
                await signOut();
              }}>
                <button className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1 text-sm font-bold">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Abmelden</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-bold transition-colors flex items-center gap-1"
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
