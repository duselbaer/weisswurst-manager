'use server';

import { db } from '@/db';
import { appointments, orders, users as usersTable, appointmentItems, orderItems } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { auth, signIn } from '@/auth';
import bcrypt from 'bcryptjs';

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) return;

  const existing = await db.query.users.findFirst({
    where: eq(usersTable.email, email),
  });

  if (existing) return;

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = Math.random().toString(36).substring(2, 15);

  await db.insert(usersTable).values({
    id,
    name,
    email,
    password: hashedPassword,
  });

  try {
    await signIn('credentials', { email, password, redirectTo: '/' });
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    return { error: 'Registrierung erfolgreich, aber Anmeldung fehlgeschlagen. Bitte manuell einloggen.' };
  }
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function createAppointment(formData: FormData) {
  const session = await auth();
  const title = formData.get('title') as string;
  const date = formData.get('date') as string;
  
  let slug = slugify(title);
  if (!slug) slug = 'fruehstueck';
  
  const existing = await db.query.appointments.findFirst({
    where: eq(appointments.slug, slug),
  });
  
  if (existing) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
  }

  const [newAppointment] = await db.insert(appointments).values({
    title,
    date,
    slug,
    userId: session?.user?.id || null,
  }).returning();

  // Add default items
  const defaultItems = ['Brezen', 'Weißwurst', 'Wiener', 'Weißbier'];
  for (const name of defaultItems) {
    await db.insert(appointmentItems).values({
      appointmentId: newAppointment.id,
      name,
    });
  }

  redirect(`/f/${slug}`);
}

export async function addOrder(formData: FormData) {
  const appointmentId = parseInt(formData.get('appointmentId') as string);
  const userName = formData.get('userName') as string;
  const slug = formData.get('slug') as string;

  const [newOrder] = await db.insert(orders).values({
    appointmentId,
    userName,
  }).returning();

  // Process all item counts from formData
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('item_')) {
      const itemId = parseInt(key.replace('item_', ''));
      const count = parseInt(value as string) || 0;
      if (count > 0) {
        await db.insert(orderItems).values({
          orderId: newOrder.id,
          itemId,
          count,
        });
      }
    }
  }

  revalidatePath(`/f/${slug}`);
}

export async function deleteOrder(id: number, slug: string) {
  await db.delete(orders).where(eq(orders.id, id));
  revalidatePath(`/f/${slug}`);
  revalidatePath('/');
}

export async function toggleOrderPaid(id: number, hasPaid: boolean, slug: string) {
  await db.update(orders)
    .set({ hasPaid: hasPaid ? 1 : 0 })
    .where(eq(orders.id, id));
  
  revalidatePath(`/f/${slug}`);
}

export async function deleteAppointment(id: number) {
  await db.delete(appointments).where(eq(appointments.id, id));
  revalidatePath('/');
}

export async function toggleAppointmentStatus(id: number, isDone: boolean, slug: string) {
  await db.update(appointments)
    .set({ isDone: isDone ? 1 : 0 })
    .where(eq(appointments.id, id));
  
  revalidatePath('/');
  revalidatePath(`/f/${slug}`);
}

export async function updateAppointmentPrices(formData: FormData) {
  const slug = formData.get('slug') as string;
  
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('price_')) {
      const itemId = parseInt(key.replace('price_', ''));
      const unitPriceCents = Math.round(parseFloat((value as string).replace(',', '.')) * 100) || 0;
      
      await db.update(appointmentItems)
        .set({ unitPriceCents })
        .where(eq(appointmentItems.id, itemId));
    }
  }

  revalidatePath(`/f/${slug}`);
  revalidatePath('/');
}

export async function addCustomItem(appointmentId: number, name: string, slug: string) {
  if (!name.trim()) return;
  
  await db.insert(appointmentItems).values({
    appointmentId,
    name: name.trim(),
  });
  
  revalidatePath(`/f/${slug}`);
}

export async function removeCustomItem(itemId: number, slug: string) {
  await db.delete(appointmentItems).where(eq(appointmentItems.id, itemId));
  revalidatePath(`/f/${slug}`);
}

export async function updateAppointmentInfo(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const slug = formData.get('slug') as string;
  const title = formData.get('title') as string;
  const date = formData.get('date') as string;

  await db.update(appointments)
    .set({ title, date })
    .where(eq(appointments.id, id));

  revalidatePath(`/f/${slug}`);
  revalidatePath('/');
}

export async function getAllAppointments(userId?: string) {
  if (!userId) return [];
  
  return await db.query.appointments.findMany({
    where: eq(appointments.userId, userId),
    with: {
      orders: {
        with: {
          items: true
        }
      },
      items: true
    },
    orderBy: (appointments, { asc }) => [asc(appointments.date)],
  });
}

export async function getAppointmentBySlug(slug: string) {
  return await db.query.appointments.findFirst({
    where: eq(appointments.slug, slug),
    with: {
      orders: {
        with: {
          items: true
        }
      },
      items: true
    },
  });
}
