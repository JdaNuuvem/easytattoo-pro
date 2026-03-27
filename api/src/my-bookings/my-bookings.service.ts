import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MyBookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
    });

    if (!client) {
      return { bookings: [], total: 0 };
    }

    const bookings = await this.prisma.booking.findMany({
      where: { clientId: client.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            instagram: true,
          },
        },
        studio: {
          select: {
            name: true,
            address: true,
          },
        },
        references: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { bookings, total: bookings.length };
  }

  async findByPhone(phone: string) {
    const cleanPhone = phone.replace(/\D/g, '');

    const clients = await this.prisma.client.findMany({
      where: {
        phone: { contains: cleanPhone },
      },
    });

    if (clients.length === 0) {
      return [];
    }

    const clientIds = clients.map((c) => c.id);

    const bookings = await this.prisma.booking.findMany({
      where: { clientId: { in: clientIds } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            instagram: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings;
  }

  async findById(userId: string, bookingId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
    });

    if (!client) {
      throw new NotFoundException('Client profile not found');
    }

    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        clientId: client.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            instagram: true,
            phone: true,
          },
        },
        studio: {
          select: {
            name: true,
            address: true,
            city: true,
            state: true,
          },
        },
        references: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }
}
