'use server';

import { db } from '@/db';
import { appointments, orders, users as usersTable } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
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

  await signIn('credentials', { email, password, redirectTo: '/' });
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '');      // Trim - from end of text
}

export async function createAppointment(formData: FormData) {
  const session = await auth();
  const title = formData.get('title') as string;
  const date = formData.get('date') as string;
  
  let slug = slugify(title);
  if (!slug) slug = 'fruehstueck';
  
  // Check if slug exists, if so append random string
  const existing = await db.query.appointments.findFirst({
    where: eq(appointments.slug, slug),
  });
  
  if (existing) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
  }

  await db.insert(appointments).values({
    title,
    date,
    slug,
    userId: session?.user?.id || null,
  });

  redirect(`/f/${slug}`);
}

export async function addOrder(formData: FormData) {
  const appointmentId = parseInt(formData.get('appointmentId') as string);
  const userName = formData.get('userName') as string;
  const brezenCount = parseInt(formData.get('brezenCount') as string) || 0;
  const weisswurstCount = parseInt(formData.get('weisswurstCount') as string) || 0;
  const wienerCount = parseInt(formData.get('wienerCount') as string) || 0;
  const weissbierCount = parseInt(formData.get('weissbierCount') as string) || 0;
  const slug = formData.get('slug') as string;

  await db.insert(orders).values({
    appointmentId,
    userName,
    brezenCount,
    weisswurstCount,
    wienerCount,
    weissbierCount,
  });

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
  const id = parseInt(formData.get('id') as string);
  const slug = formData.get('slug') as string;
  
  const priceBreze = Math.round(parseFloat((formData.get('priceBreze') as string).replace(',', '.')) * 100) || 0;
  const priceWeisswurst = Math.round(parseFloat((formData.get('priceWeisswurst') as string).replace(',', '.')) * 100) || 0;
  const priceWiener = Math.round(parseFloat((formData.get('priceWiener') as string).replace(',', '.')) * 100) || 0;
  const priceWeissbier = Math.round(parseFloat((formData.get('priceWeissbier') as string).replace(',', '.')) * 100) || 0;

  await db.update(appointments)
    .set({ priceBreze, priceWeisswurst, priceWiener, priceWeissbier })
    .where(eq(appointments.id, id));

  revalidatePath(`/f/${slug}`);
  revalidatePath('/');
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
      orders: true,
    },
    orderBy: (appointments, { asc }) => [asc(appointments.date)],
  });
}

export async function getAppointmentBySlug(slug: string) {
  return await db.query.appointments.findFirst({
    where: eq(appointments.slug, slug),
    with: {
      orders: true,
    },
  });
}
