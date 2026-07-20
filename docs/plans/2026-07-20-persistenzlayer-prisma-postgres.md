# Persistenzlayer-Migration: Drizzle/SQLite → Prisma/Postgres (Neon via Vercel Marketplace)

**Datum:** 2026-07-20
**Status:** Abgeschlossen. Code-Migration, Neon-Provisionierung und End-to-End-Verifikation im Browser (Registrierung, Login, Termin, Bestellung, Preise, Zahl-Status, Löschen) erfolgreich durchlaufen.

## Anfrage

> Stelle den Persistenzlayer um - ich möchte nur im äußersten Notfall sqlite benutzen. Idealerweise benutzen wir Prisma mit Postgres.

## Kontext & Entscheidungen

Der Stack nutzte bisher Drizzle ORM auf einer lokalen `sqlite.db`. Ziel war die Ablösung durch Prisma als ORM mit einer echten Postgres-Datenbank.

- **Postgres-Hosting:** Vercel Marketplace (Neon) — das Projekt ist von Vercel-Seite bereits mit einem Vercel-Projekt verlinkt (GitHub-Integration im Dashboard), lokal fehlte nur `.vercel/project.json`.
- **Boolean statt Integer-Flags:** `isDone` (Appointment) und `hasPaid` (Order) liefen unter SQLite/Drizzle als `0/1`-Integer. Da Postgres/Prisma native `Boolean`-Typen unterstützt, wurden beide Felder auf `Boolean` umgestellt — ein reines SQLite-Relikt entfällt damit. Betroffen: `prisma/schema.prisma`, `src/app/actions.ts`, `AppointmentOverview.tsx`, `src/app/f/[slug]/page.tsx`.
- **User.id:** von manuell generierter `Math.random().toString(36)`-ID auf Prisma-Default `cuid()` umgestellt.
- **Es gab keine Bestandsdaten zu migrieren** — weder `sqlite.db` noch ein Drizzle-Migrationsordner existierten im Repo, das vereinfachte die Umstellung erheblich.
- **Konvention für künftige Architekturentscheidungen:** Zusammengefasste Pläne wie dieser werden künftig unter `docs/plans/` im Repo abgelegt, nicht nur lokal im Claude-Code-Plan-Verzeichnis.

## Überraschung: Prisma 7 unterscheidet sich stark von älteren Versionen

Die installierte Version ist Prisma **7.9.0** — deutlich anders als der in Trainingsdaten übliche Stand:

- Die Connection-URL für die CLI (Migrationen etc.) wird **nicht** mehr im `datasource`-Block von `schema.prisma` gesetzt, sondern in `prisma.config.ts` (`datasource.url`). `directUrl` als Schema-Feld existiert nicht mehr.
- Der generierte Client wird per **Driver-Adapter** instanziiert (`@prisma/adapter-pg` mit `PrismaPg`) statt implizit über eine Connection-URL im Client-Konstruktor.
- Der generierte Client liegt unter `src/generated/prisma/` mit `client.ts` als Haupt-Einstiegspunkt (Import: `@/generated/prisma/client`) — es gibt kein `index.ts`-Barrel.
- `prisma init` installiert automatisch CLI-Referenz-Skills für mehrere Agent-Ökosysteme (`.claude/skills/`, `.windsurf/skills/`, `.agents/skills/`). Die projektfremden Verzeichnisse (`.windsurf/`, `.agents/`) wurden entfernt, `.claude/skills/prisma-cli` und `.claude/skills/prisma-client-api` bleiben als Referenz erhalten (siehe Hinweis in `AGENTS.md`).

Da diese Unterschiede exakt der bestehenden Warnung in `AGENTS.md` zu Next.js entsprechen ("nicht das Next.js, das du kennst"), wurde ein analoger Hinweis für Prisma ergänzt.

## Umgesetzte Änderungen (Code)

- **Dependencies:** `drizzle-orm`, `better-sqlite3`, `@auth/drizzle-adapter`, `drizzle-kit`, `@types/better-sqlite3` entfernt; `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `@auth/prisma-adapter` hinzugefügt.
- **`prisma/schema.prisma`:** alle Drizzle-Tabellen 1:1 als Prisma-Modelle übersetzt (`User`, `Account`, `Session`, `VerificationToken`, `Appointment`, `AppointmentItem`, `Order`, `OrderItem`), Tabellennamen via `@@map` als snake_case wie zuvor erhalten.
- **`prisma.config.ts`:** lädt `.env.local` vor `.env` (die Prisma-CLI lädt standardmäßig nur `.env`, `vercel env pull` schreibt aber nach `.env.local`); nutzt `DATABASE_URL_UNPOOLED` für Migrationen, mit Fallback auf `DATABASE_URL`.
- **`src/db/index.ts`:** Prisma-Client-Singleton mit `PrismaPg`-Adapter und `globalThis`-Caching (Standardmuster gegen Verbindungsvervielfachung im Dev-Hot-Reload).
- **`src/db/types.ts`** (neu, ersetzt `src/db/schema.ts`): zusammengesetzter `Appointment`-Typ via `Prisma.AppointmentGetPayload`.
- **`src/auth.ts`:** `DrizzleAdapter` → `PrismaAdapter`, User-Lookup auf `db.user.findFirst` umgestellt.
- **`src/app/actions.ts`:** alle Drizzle-Queries auf Prisma-Client-Calls umgestellt; Bulk-Inserts (Default-Items, Order-Items) nutzen `createMany` statt Einzel-Inserts in einer Schleife.
- **`package.json`:** `postinstall: prisma generate` sowie `db:push`/`db:migrate`/`db:generate`/`db:studio` ergänzt.
- **`.env.sample`:** `DATABASE_URL`/`DATABASE_URL_UNPOOLED` ergänzt.
- **`.gitignore`:** `sqlite.db`-Einträge entfernt, `/src/generated/prisma` (von `prisma init` automatisch ergänzt) bleibt ignoriert.

## Infrastruktur (Vercel + Neon) — durchgeführt

1. `vercel link` gegen das bestehende Projekt `duselbaers-projects/weisswurst-manager` (Team per Rückfrage geklärt).
2. Neon-Postgres über `vercel integration add neon` provisioniert: Region Frankfurt (`fra1`), Plan `free_v3`, Neon-eigene Auth-Integration deaktiviert (`auth=false`, da die App bereits NextAuth nutzt) — nach expliziter Bestätigung durch den Nutzer.
3. `AUTH_SECRET` fehlte nach dem `env pull` (war nie in Vercel hinterlegt, nur als Beispielwert in `.env.sample`) — für Development und Preview neu generiert und via `vercel env add` hinterlegt; Production wurde bewusst ausgelassen (vom Auto-Mode-Classifier als produktionsverändernde Aktion blockiert, zurecht — das sollte der Nutzer selbst freigeben).
4. `npx prisma migrate dev --name init` gegen die neue Datenbank ausgeführt — Migration liegt unter `prisma/migrations/20260720215615_init/`.
5. Manueller Durchlauf im Browser: Registrierung, Login, Termin erstellen (inkl. Default-Artikel), Bestellung abgeben, Preise festlegen, Zahl-Status togglen, Termin löschen — alles über die Weboberfläche gegen die echte Neon-Datenbank verifiziert und danach wieder aufgeräumt (Testtermin gelöscht).

## Offen / Follow-up

- **`AUTH_SECRET` für Production** ist in Vercel noch nicht gesetzt — das committende Deployment auf `main` wird ohne diesen Wert mit `MissingSecret` fehlschlagen. Vor dem nächsten Production-Deploy per `vercel env add AUTH_SECRET production` (oder im Dashboard) ergänzen.
- `npm run lint` zeigt einen vorbestehenden, migrationsunabhängigen Fehler in `src/components/ThemeToggle.tsx` (`react-hooks/set-state-in-effect`) — nicht Teil dieser Änderung.
