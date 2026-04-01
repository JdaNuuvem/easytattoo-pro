import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { bookingId: string; rating: number; comment?: string }) {
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { review: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== 'COMPLETED') throw new BadRequestException('Can only review completed bookings');
    if (booking.review) throw new BadRequestException('This booking already has a review');

    return this.prisma.review.create({
      data: {
        bookingId: data.bookingId,
        clientId: booking.clientId,
        userId: booking.userId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        client: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async getByArtist(userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { userId },
      include: {
        client: { select: { firstName: true, lastName: true } },
        booking: { select: { tattooType: true, bodyLocation: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const avg = reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

    return {
      reviews,
      averageRating: avg,
      totalReviews: reviews.length,
    };
  }

  async getByBooking(bookingId: string) {
    return this.prisma.review.findUnique({
      where: { bookingId },
      include: {
        client: { select: { firstName: true, lastName: true } },
      },
    });
  }
}
