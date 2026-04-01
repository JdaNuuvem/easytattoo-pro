import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface FindAllOptions {
  readonly userId: string;
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
}

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: FindAllOptions) {
    const { userId, page = 1, limit = 20, search } = options;

    const where: any = {
      bookings: {
        some: { userId },
      },
    };

    if (search) {
      const sanitized = search.slice(0, 100).trim();
      where.OR = [
        { firstName: { contains: sanitized, mode: 'insensitive' } },
        { lastName: { contains: sanitized, mode: 'insensitive' } },
        { phone: { contains: sanitized } },
        { email: { contains: sanitized, mode: 'insensitive' } },
        { instagram: { contains: sanitized, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        include: {
          bookings: {
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              status: true,
              totalPrice: true,
              scheduledDate: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              bookings: {
                where: { userId },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data: clients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(clientId: string, userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        bookings: { where: { userId }, take: 1 },
        _count: {
          select: {
            bookings: { where: { userId } },
          },
        },
      },
    });

    if (!client || client.bookings.length === 0) {
      throw new NotFoundException('Client not found');
    }

    const { bookings, ...clientData } = client;
    return clientData;
  }

  async findBookings(clientId: string, userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.prisma.booking.findMany({
      where: {
        clientId,
        userId,
      },
      include: {
        references: true,
        studio: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
