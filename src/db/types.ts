import { Prisma } from '@/generated/prisma/client';

export type Appointment = Prisma.AppointmentGetPayload<{
  include: {
    items: true;
    orders: { include: { items: true } };
  };
}>;
