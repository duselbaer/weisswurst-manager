<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Projektüberblick

**weisswurst-manager** ist eine App zur Organisation von Weißwurst-Terminen: Termine mit Artikeln/Preisen anlegen, Bestellungen dazu erfassen, Bezahlstatus tracken und Termine über einen öffentlichen Share-Link (`/f/[slug]`) mit Teilnehmern teilen.

## Tech-Stack

- **Next.js 16.2.10** (App Router) + **React 19.2.4**, TypeScript `^5` (strict)
- **Tailwind CSS 4** (CSS-first, kein `tailwind.config.js` — Konfiguration läuft über `@theme`/`@custom-variant` in `src/app/globals.css`)
- **Drizzle ORM** (`drizzle-orm` + `better-sqlite3`) als Datenbankschicht
- **NextAuth v5 (beta)** mit `@auth/drizzle-adapter` für Login/Sessions
- **next-themes** für Light/Dark Mode ("Bavarian Night Blue"-Farbschema)

## Struktur

```
src/
├── app/
│   ├── actions.ts                     # Server Actions (Termine, Bestellungen, Preise)
│   ├── api/auth/[...nextauth]/route.ts
│   ├── f/[slug]/page.tsx              # öffentliche Termin-/Bestellansicht
│   ├── login/, register/              # Auth-Seiten
│   └── globals.css                    # Tailwind 4 Theme + Dark-Mode-Variablen
├── components/                        # AppointmentForm, OrderForm, PriceEditor, ThemeToggle, AdBanner, …
├── db/
│   ├── index.ts                       # Drizzle-Client (better-sqlite3)
│   └── schema.ts                      # Tabellen: user/account/session (Auth) + appointments/appointmentItems/orders/orderItems
└── auth.ts                            # NextAuth-Konfiguration
```

## Datenbank

- Schema: `src/db/schema.ts`, Config: `drizzle.config.ts` (SQLite-Dialekt, DB-Datei `sqlite.db` im Projektroot, nicht getrackt).
- Es gibt kein `db:*`-npm-Script — Migrationen laufen direkt über `npx drizzle-kit generate` bzw. `npx drizzle-kit push`.
- Domänenmodell: `appointments` (1:n `appointmentItems`, 1:n `orders`), `orders` (1:n `orderItems`, Feld `hasPaid`), `orderItems` referenziert `appointmentItems`.

## Auth

- NextAuth v5 beta, konfiguriert in `src/auth.ts`, Drizzle-Adapter persistiert Accounts/Sessions in denselben Tabellen wie oben.
- Passwort-Hashing via `bcryptjs`.
- Benötigte Env-Vars (siehe `.env.sample`): `AUTH_SECRET`, `NEXTAUTH_URL`.

## Styling

- Tailwind 4 ohne separates Config-File; Theme-Tokens (`--background`, `--foreground`, `--card`, `--border`, …) sind als CSS-Variablen in `:root`/`.dark` definiert und über `@theme inline` an Tailwind gebunden.
- Dark Mode wird über `next-themes` (`ThemeProvider.tsx`, `ThemeToggle.tsx`) und den `@custom-variant dark`-Selektor gesteuert.

## Entwicklung

- Package Manager: **npm** (`package-lock.json` ist die einzige Lockfile).
- Node-Version: **24**, verwaltet über `mise.toml`.
- Befehle: `npm run dev`, `npm run build`, `npm run start`, `npm run lint` (ESLint Flat Config, `eslint-config-next`).
- Es existiert **kein Testframework/-Script** — Änderungen werden aktuell nur über `npm run lint` und manuelles Prüfen abgesichert.

## Konventionen

- Pfad-Alias `@/*` zeigt auf `./src/*`.
- Datenzugriffe/-mutationen laufen als Next.js Server Actions in `src/app/actions.ts`, nicht über klassische API-Routen (Ausnahme: NextAuth-Route).
- TypeScript läuft im `strict`-Modus — keine impliziten `any`.
