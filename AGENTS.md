<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Prisma ist ebenfalls nicht das Prisma, das du kennst

Prisma 7 hat gegenüber älteren Versionen ebenfalls Breaking Changes: Konfiguration läuft über `prisma.config.ts` statt über `url`/`directUrl` im `datasource`-Block, der Client wird per Driver-Adapter (`@prisma/adapter-pg`) instanziiert statt implizit über die Connection-URL, und der generierte Client liegt unter `src/generated/prisma/client.ts` (Import über `@/generated/prisma/client`, kein Barrel-`index.ts`). Bei Unsicherheit die offizielle Prisma-7-Dokumentation konsultieren, bevor auf Trainingsdaten-Wissen zurückgegriffen wird.

## Projektüberblick

**weisswurst-manager** ist eine App zur Organisation von Weißwurst-Terminen: Termine mit Artikeln/Preisen anlegen, Bestellungen dazu erfassen, Bezahlstatus tracken und Termine über einen öffentlichen Share-Link (`/f/[slug]`) mit Teilnehmern teilen.

## Tech-Stack

- **Next.js 16.2.10** (App Router) + **React 19.2.4**, TypeScript `^5` (strict)
- **Tailwind CSS 4** (CSS-first, kein `tailwind.config.js` — Konfiguration läuft über `@theme`/`@custom-variant` in `src/app/globals.css`)
- **Prisma 7** (`@prisma/client` + `@prisma/adapter-pg`) mit **Postgres** (Neon, provisioniert über den Vercel Marketplace) als Datenbankschicht
- **NextAuth v5 (beta)** mit `@auth/prisma-adapter` für Login/Sessions
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
│   ├── index.ts                       # Prisma-Client-Singleton (Driver-Adapter @prisma/adapter-pg)
│   └── types.ts                       # zusammengesetzte Typen (z. B. Appointment inkl. Relationen) via Prisma.*GetPayload
├── generated/prisma/                  # generierter Prisma Client (nicht getrackt, via `prisma generate`)
└── auth.ts                            # NextAuth-Konfiguration
```

Schema: `prisma/schema.prisma` · Migrationen: `prisma/migrations/` (getrackt) · CLI-Konfig: `prisma.config.ts`.

## Datenbank

- Schema: `prisma/schema.prisma` (Postgres, Neon via Vercel Marketplace). CLI-Konfiguration (Connection-URL für Migrationen, Migrations-Pfad) liegt in `prisma.config.ts`, nicht im `datasource`-Block.
- `npm run db:push` (schemaloses Pushen, für schnelle Iteration) bzw. `npm run db:migrate` (versionierte Migration via `prisma migrate dev`) bzw. `npm run db:generate` (Client neu generieren) bzw. `npm run db:studio` (Prisma Studio).
- `DATABASE_URL` (gepoolt, für die laufende App) und `DATABASE_URL_UNPOOLED` (direkt, für Migrationen) werden über `vercel env pull .env.local` bezogen.
- Domänenmodell: `Appointment` (1:n `AppointmentItem`, 1:n `Order`), `Order` (1:n `OrderItem`, Feld `hasPaid: Boolean`), `OrderItem` referenziert `AppointmentItem`. Tabellennamen bleiben via `@@map` snake_case (`appointments`, `appointment_items`, `orders`, `order_items`).

## Auth

- NextAuth v5 beta, konfiguriert in `src/auth.ts`, `PrismaAdapter` persistiert Accounts/Sessions in denselben Tabellen wie oben.
- Passwort-Hashing via `bcryptjs`.
- Benötigte Env-Vars (siehe `.env.sample`): `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AUTH_SECRET`, `NEXTAUTH_URL`.

## Styling

- Tailwind 4 ohne separates Config-File; Theme-Tokens (`--background`, `--foreground`, `--card`, `--border`, …) sind als CSS-Variablen in `:root`/`.dark` definiert und über `@theme inline` an Tailwind gebunden.
- Dark Mode wird über `next-themes` (`ThemeProvider.tsx`, `ThemeToggle.tsx`) und den `@custom-variant dark`-Selektor gesteuert.

## Entwicklung

- Package Manager: **npm** (`package-lock.json` ist die einzige Lockfile).
- Node-Version: **24**, verwaltet über `mise.toml`.
- Befehle: `npm run dev`, `npm run build`, `npm run start`, `npm run lint` (ESLint Flat Config, `eslint-config-next`), `npm run db:*` (siehe Abschnitt Datenbank).
- Es existiert **kein Testframework/-Script** — Änderungen werden aktuell nur über `npm run lint` und manuelles Prüfen abgesichert.

## Konventionen

- Pfad-Alias `@/*` zeigt auf `./src/*`.
- Datenzugriffe/-mutationen laufen als Next.js Server Actions in `src/app/actions.ts`, nicht über klassische API-Routen (Ausnahme: NextAuth-Route).
- TypeScript läuft im `strict`-Modus — keine impliziten `any`.
- Größere Architekturentscheidungen (wie diese Persistenzlayer-Migration) werden als Plan in `docs/plans/` dokumentiert — dort nachschauen für den Kontext hinter nicht offensichtlichen Design-Entscheidungen.
