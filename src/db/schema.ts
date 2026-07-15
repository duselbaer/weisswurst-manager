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
  isDone: integer('is_done').notNull().default(0),
});

export const appointmentItems = sqliteTable('appointment_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  appointmentId: integer('appointment_id').notNull().references(() => appointments.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  unitPriceCents: integer('unit_price_cents').notNull().default(0),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  appointmentId: integer('appointment_id').notNull().references(() => appointments.id, { onDelete: 'cascade' }),
  userName: text('user_name').notNull(),
  hasPaid: integer('has_paid').notNull().default(0),
});

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  itemId: integer('item_id').notNull().references(() => appointmentItems.id, { onDelete: 'cascade' }),
  count: integer('count').notNull().default(0),
});

export const appointmentsRelations = relations(appointments, ({ many, one }) => ({
  orders: many(orders),
  items: many(appointmentItems),
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
}));

export const appointmentItemsRelations = relations(appointmentItems, ({ one, many }) => ({
  appointment: one(appointments, {
    fields: [appointmentItems.appointmentId],
    references: [appointments.id],
  }),
  orderEntries: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  appointment: one(appointments, {
    fields: [orders.appointmentId],
    references: [appointments.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  item: one(appointmentItems, {
    fields: [orderItems.itemId],
    references: [appointmentItems.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
}));

export type Appointment = typeof appointments.$inferSelect & {
  items: AppointmentItem[];
  orders: (typeof orders.$inferSelect & {
    items: OrderItem[];
  })[];
};
export type AppointmentItem = typeof appointmentItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type User = typeof users.$inferSelect;
