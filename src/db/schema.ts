import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import type { AdapterAccount } from 'next-auth/adapters';

export const users = sqliteTable('user', {
  id: text('id').notNull().primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  password: text('password'),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
});

export const accounts = sqliteTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  })
);

export const sessions = sqliteTable('session', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
});

export const verificationTokens = sqliteTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const appointments = sqliteTable('appointments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  date: text('date').notNull(),
  slug: text('slug').notNull().unique(),
  priceBreze: integer('price_breze').notNull().default(0),
  priceWeisswurst: integer('price_weisswurst').notNull().default(0),
  priceWiener: integer('price_wiener').notNull().default(0),
  priceWeissbier: integer('price_weissbier').notNull().default(0),
  isDone: integer('is_done').notNull().default(0),
});

export const appointmentsRelations = relations(appointments, ({ many, one }) => ({
  orders: many(orders),
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
}));

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  appointmentId: integer('appointment_id').notNull().references(() => appointments.id, { onDelete: 'cascade' }),
  userName: text('user_name').notNull(),
  brezenCount: integer('brezen_count').notNull().default(0),
  weisswurstCount: integer('weisswurst_count').notNull().default(0),
  wienerCount: integer('wiener_count').notNull().default(0),
  weissbierCount: integer('weissbier_count').notNull().default(0),
  hasPaid: integer('has_paid').notNull().default(0),
});

export const ordersRelations = relations(orders, ({ one }) => ({
  appointment: one(appointments, {
    fields: [orders.appointmentId],
    references: [appointments.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
}));

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type User = typeof users.$inferSelect;
