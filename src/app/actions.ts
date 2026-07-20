'use server';

import { db } from '@/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth, signIn } from '@/auth';
import bcrypt from 'bcryptjs';

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) return;

  const existing = await db.user.findFirst({
    where: { email },
  });

  if (existing) return;

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
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

  const existing = await db.appointment.findFirst({
    where: { slug },
  });

  if (existing) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
  }

  const newAppointment = await db.appointment.create({
    data: {
      title,
      date,
      slug,
      userId: session?.user?.id || null,
    },
  });

  // Add default items
  const defaultItems = ['Brezen', 'Weißwurst', 'Wiener', 'Weißbier'];
  await db.appointmentItem.createMany({
    data: defaultItems.map((name) => ({
      appointmentId: newAppointment.id,
      name,
    })),
  });

  redirect(`/f/${slug}`);
}

export async function addOrder(formData: FormData) {
  const appointmentId = parseInt(formData.get('appointmentId') as string);
  const userName = formData.get('userName') as string;
  const slug = formData.get('slug') as string;

  const newOrder = await db.order.create({
    data: {
      appointmentId,
      userName,
    },
  });

  // Process all item counts from formData
  const orderItems: { orderId: number; itemId: number; count: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('item_')) {
      const itemId = parseInt(key.replace('item_', ''));
      const count = parseInt(value as string) || 0;
      if (count > 0) {
        orderItems.push({ orderId: newOrder.id, itemId, count });
      }
    }
  }

  if (orderItems.length > 0) {
    await db.orderItem.createMany({ data: orderItems });
  }

  revalidatePath(`/f/${slug}`);
}

export async function deleteOrder(id: number, slug: string) {
  await db.order.delete({ where: { id } });
  revalidatePath(`/f/${slug}`);
  revalidatePath('/');
}

export async function toggleOrderPaid(id: number, hasPaid: boolean, slug: string) {
  await db.order.update({
    where: { id },
    data: { hasPaid },
  });

  revalidatePath(`/f/${slug}`);
}

export async function deleteAppointment(id: number) {
  await db.appointment.delete({ where: { id } });
  revalidatePath('/');
}

export async function toggleAppointmentStatus(id: number, isDone: boolean, slug: string) {
  await db.appointment.update({
    where: { id },
    data: { isDone },
  });

  revalidatePath('/');
  revalidatePath(`/f/${slug}`);
}

export async function updateAppointmentPrices(formData: FormData) {
  const slug = formData.get('slug') as string;

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('price_')) {
      const itemId = parseInt(key.replace('price_', ''));
      const unitPriceCents = Math.round(parseFloat((value as string).replace(',', '.')) * 100) || 0;

      await db.appointmentItem.update({
        where: { id: itemId },
        data: { unitPriceCents },
      });
    }
  }

  revalidatePath(`/f/${slug}`);
  revalidatePath('/');
}

export async function addCustomItem(appointmentId: number, name: string, slug: string) {
  if (!name.trim()) return;

  await db.appointmentItem.create({
    data: {
      appointmentId,
      name: name.trim(),
    },
  });

  revalidatePath(`/f/${slug}`);
}

export async function removeCustomItem(itemId: number, slug: string) {
  await db.appointmentItem.delete({ where: { id: itemId } });
  revalidatePath(`/f/${slug}`);
}

export async function updateAppointmentInfo(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const slug = formData.get('slug') as string;
  const title = formData.get('title') as string;
  const date = formData.get('date') as string;

  await db.appointment.update({
    where: { id },
    data: { title, date },
  });

  revalidatePath(`/f/${slug}`);
  revalidatePath('/');
}

export async function getAllAppointments(userId?: string) {
  if (!userId) return [];

  return await db.appointment.findMany({
    where: { userId },
    include: {
      orders: {
        include: {
          items: true,
        },
      },
      items: true,
    },
    orderBy: { date: 'asc' },
  });
}

export async function getAppointmentBySlug(slug: string) {
  return await db.appointment.findFirst({
    where: { slug },
    include: {
      orders: {
        include: {
          items: true,
        },
      },
      items: true,
    },
  });
}
