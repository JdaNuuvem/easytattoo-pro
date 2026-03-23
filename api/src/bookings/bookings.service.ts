import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PricingService } from '../pricing/pricing.service';

interface FindAllOptions {
  readonly userId: string;
  readonly page?: number;
  readonly limit?: number;
  readonly status?: string;
  readonly startDate?: string;
  readonly endDate?: string;
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
  ) {}

  async create(dto: CreateBookingDto) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('Tattoo artist not found');
    }

    // Find or create client
    let client = await this.prisma.client.findFirst({
      where: {
        phone: dto.phone,
        firstName: dto.firstName,
      },
    });

    if (!client) {
      client = await this.prisma.client.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          email: dto.email,
          instagram: dto.instagram,
        },
      });
    } else {
      // Update client info if changed
      client = await this.prisma.client.update({
        where: { id: client.id },
        data: {
          lastName: dto.lastName,
          email: dto.email || client.email,
          instagram: dto.instagram || client.instagram,
        },
      });
    }

    // Calculate price using pricing service
    const priceResult = await this.pricingService.calculatePrice({
      userId: dto.userId,
      tattooType: dto.tattooType,
      tattooWidth: dto.tattooWidth,
      tattooHeight: dto.tattooHeight,
      shadingType: dto.shadingType,
      colorType: dto.colorType,
      bodyLocation: dto.bodyLocation,
      promotion: dto.promotion || 'NONE',
    });

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        clientId: client.id,
        userId: dto.userId,
        studioId: dto.studioId,
        tattooType: dto.tattooType as any,
        tattooWidth: dto.tattooWidth,
        tattooHeight: dto.tattooHeight,
        shadingType: dto.shadingType as any,
        colorType: dto.colorType as any,
        bodyLocation: dto.bodyLocation,
        hasCompanion: dto.hasCompanion || false,
        description: dto.description,
        promotion: (dto.promotion || 'NONE') as any,
        scheduledDate: dto.scheduledDate
          ? new Date(dto.scheduledDate)
          : null,
        scheduledTime: dto.scheduledTime,
        estimatedDuration: dto.estimatedDuration,
        totalPrice: priceResult.totalPrice,
        depositAmount: priceResult.depositAmount,
      },
      include: {
        client: true,
        references: true,
      },
    });

    // Create reference images if provided
    if (dto.referenceImages && dto.referenceImages.length > 0) {
      await this.prisma.bookingReference.createMany({
        data: dto.referenceImages.map((imageUrl) => ({
          bookingId: booking.id,
          imageUrl,
        })),
      });
    }

    return this.findById(booking.id);
  }

  async findAll(options: FindAllOptions) {
    const { userId, page = 1, limit = 20, status, startDate, endDate } = options;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          client: true,
          studio: {
            select: { id: true, name: true },
          },
          references: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            instagram: true,
            pixKey: true,
            pixName: true,
            pixBank: true,
          },
        },
        studio: true,
        references: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async updateStatus(bookingId: string, userId: string, status: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[booking.status] || [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Cannot transition from ${booking.status} to ${status}`,
      );
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: status as any },
      include: {
        client: true,
        references: true,
      },
    });
  }

  async confirmBooking(
    bookingId: string,
    userId: string,
    paymentProof?: string,
  ) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        depositPaid: true,
        paymentProof: paymentProof || booking.paymentProof,
        status: 'CONFIRMED',
      },
      include: {
        client: true,
        references: true,
      },
    });
  }

  async cancel(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
      include: {
        client: true,
        references: true,
      },
    });
  }
}
