import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenue(
    userId: string,
    period: string = 'month',
    startDate?: string,
    endDate?: string,
  ) {
    const dateFilter = this.buildDateFilter(period, startDate, endDate);

    // Total revenue from completed bookings
    const completedBookings = await this.prisma.booking.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        createdAt: dateFilter,
      },
      select: {
        totalPrice: true,
        depositAmount: true,
        depositPaid: true,
        createdAt: true,
      },
    });

    const totalRevenue = completedBookings.reduce(
      (sum, b) => sum + b.totalPrice,
      0,
    );
    const totalDeposits = completedBookings
      .filter((b) => b.depositPaid)
      .reduce((sum, b) => sum + b.depositAmount, 0);

    // Pending deposits
    const pendingBookings = await this.prisma.booking.findMany({
      where: {
        userId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        depositPaid: false,
        createdAt: dateFilter,
      },
      select: { depositAmount: true },
    });

    const pendingDeposits = pendingBookings.reduce(
      (sum, b) => sum + b.depositAmount,
      0,
    );

    // Revenue grouped by date
    const revenueByDay: Record<string, number> = {};
    for (const booking of completedBookings) {
      const day = booking.createdAt.toISOString().split('T')[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + booking.totalPrice;
    }

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalDeposits: Math.round(totalDeposits * 100) / 100,
      pendingDeposits: Math.round(pendingDeposits * 100) / 100,
      completedCount: completedBookings.length,
      averageTicket:
        completedBookings.length > 0
          ? Math.round((totalRevenue / completedBookings.length) * 100) / 100
          : 0,
      revenueByDay,
    };
  }

  async getBookingStats(
    userId: string,
    period: string = 'month',
    startDate?: string,
    endDate?: string,
  ) {
    const dateFilter = this.buildDateFilter(period, startDate, endDate);

    const [total, pending, confirmed, inProgress, completed, cancelled] =
      await Promise.all([
        this.prisma.booking.count({
          where: { userId, createdAt: dateFilter },
        }),
        this.prisma.booking.count({
          where: {
            userId,
            status: 'PENDING',
            createdAt: dateFilter,
          },
        }),
        this.prisma.booking.count({
          where: {
            userId,
            status: 'CONFIRMED',
            createdAt: dateFilter,
          },
        }),
        this.prisma.booking.count({
          where: {
            userId,
            status: 'IN_PROGRESS',
            createdAt: dateFilter,
          },
        }),
        this.prisma.booking.count({
          where: {
            userId,
            status: 'COMPLETED',
            createdAt: dateFilter,
          },
        }),
        this.prisma.booking.count({
          where: {
            userId,
            status: 'CANCELLED',
            createdAt: dateFilter,
          },
        }),
      ]);

    const conversionRate =
      total > 0
        ? Math.round(((completed / total) * 100) * 100) / 100
        : 0;
    const cancellationRate =
      total > 0
        ? Math.round(((cancelled / total) * 100) * 100) / 100
        : 0;

    return {
      total,
      pending,
      confirmed,
      inProgress,
      completed,
      cancelled,
      conversionRate,
      cancellationRate,
    };
  }

  async getClientStats(
    userId: string,
    period: string = 'month',
    startDate?: string,
    endDate?: string,
  ) {
    const dateFilter = this.buildDateFilter(period, startDate, endDate);

    // Clients who booked in this period
    const bookingsInPeriod = await this.prisma.booking.findMany({
      where: {
        userId,
        createdAt: dateFilter,
      },
      select: {
        clientId: true,
        client: {
          select: { createdAt: true },
        },
      },
    });

    const uniqueClientIds = [
      ...new Set(bookingsInPeriod.map((b) => b.clientId)),
    ];

    // Determine new vs returning clients
    let newClients = 0;
    let returningClients = 0;

    for (const clientId of uniqueClientIds) {
      const previousBookings = await this.prisma.booking.count({
        where: {
          userId,
          clientId,
          createdAt: {
            lt: dateFilter.gte || new Date(0),
          },
        },
      });

      if (previousBookings > 0) {
        returningClients++;
      } else {
        newClients++;
      }
    }

    // Total unique clients ever
    const allBookings = await this.prisma.booking.findMany({
      where: { userId },
      select: { clientId: true },
      distinct: ['clientId'],
    });

    return {
      totalClientsEver: allBookings.length,
      clientsInPeriod: uniqueClientIds.length,
      newClients,
      returningClients,
      returnRate:
        uniqueClientIds.length > 0
          ? Math.round(
              ((returningClients / uniqueClientIds.length) * 100) * 100,
            ) / 100
          : 0,
    };
  }

  async getPopularTimes(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        userId,
        scheduledTime: { not: null },
        status: { in: ['CONFIRMED', 'COMPLETED', 'IN_PROGRESS'] },
      },
      select: {
        scheduledTime: true,
        scheduledDate: true,
      },
    });

    // Count by hour of day
    const hourCounts: Record<string, number> = {};
    for (let h = 0; h < 24; h++) {
      const key = `${h.toString().padStart(2, '0')}:00`;
      hourCounts[key] = 0;
    }

    // Count by day of week
    const dayCounts: Record<number, number> = {};
    for (let d = 0; d < 7; d++) {
      dayCounts[d] = 0;
    }

    for (const booking of bookings) {
      if (booking.scheduledTime) {
        const hour = booking.scheduledTime.split(':')[0];
        const key = `${hour.padStart(2, '0')}:00`;
        hourCounts[key] = (hourCounts[key] || 0) + 1;
      }
      if (booking.scheduledDate) {
        const day = booking.scheduledDate.getDay();
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      }
    }

    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    return {
      byHour: hourCounts,
      byDayOfWeek: Object.entries(dayCounts).map(([day, count]) => ({
        day: parseInt(day),
        name: dayNames[parseInt(day)],
        count,
      })),
    };
  }

  async getFinancialReport(
    userId: string,
    period?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const dateFilter = this.buildDateFilter(period || 'year', startDate, endDate);

    // All bookings in period
    const bookings = await this.prisma.booking.findMany({
      where: {
        userId,
        createdAt: dateFilter,
      },
      select: {
        totalPrice: true,
        depositAmount: true,
        depositPaid: true,
        status: true,
        createdAt: true,
      },
    });

    // Group by month
    const revenueByMonth: Record<string, { received: number; pending: number; cancelled: number; count: number }> = {};

    for (const booking of bookings) {
      const monthKey = `${booking.createdAt.getFullYear()}-${String(booking.createdAt.getMonth() + 1).padStart(2, '0')}`;

      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = { received: 0, pending: 0, cancelled: 0, count: 0 };
      }

      revenueByMonth[monthKey].count++;

      if (booking.status === 'CANCELLED') {
        revenueByMonth[monthKey].cancelled += booking.totalPrice;
      } else if (booking.status === 'COMPLETED') {
        revenueByMonth[monthKey].received += booking.totalPrice;
      } else if (booking.depositPaid) {
        revenueByMonth[monthKey].received += booking.depositAmount;
        revenueByMonth[monthKey].pending += booking.totalPrice - booking.depositAmount;
      } else {
        revenueByMonth[monthKey].pending += booking.totalPrice;
      }
    }

    // Totals
    const totalReceived = bookings
      .filter((b) => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const totalPending = bookings
      .filter((b) => ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status))
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const totalCancelled = bookings
      .filter((b) => b.status === 'CANCELLED')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    // Current month projection
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthData = revenueByMonth[currentMonthKey];
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projectedMonthlyRevenue = currentMonthData
      ? Math.round(((currentMonthData.received + currentMonthData.pending) / dayOfMonth) * daysInMonth * 100) / 100
      : 0;

    // Round values in revenueByMonth
    const roundedRevenueByMonth: Record<string, { received: number; pending: number; cancelled: number; count: number }> = {};
    for (const [key, val] of Object.entries(revenueByMonth)) {
      roundedRevenueByMonth[key] = {
        received: Math.round(val.received * 100) / 100,
        pending: Math.round(val.pending * 100) / 100,
        cancelled: Math.round(val.cancelled * 100) / 100,
        count: val.count,
      };
    }

    return {
      totalReceived: Math.round(totalReceived * 100) / 100,
      totalPending: Math.round(totalPending * 100) / 100,
      totalCancelled: Math.round(totalCancelled * 100) / 100,
      projectedMonthlyRevenue,
      revenueByMonth: roundedRevenueByMonth,
    };
  }

  private buildDateFilter(
    period: string,
    startDate?: string,
    endDate?: string,
  ): { gte?: Date; lte?: Date } {
    if (startDate && endDate) {
      return {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const now = new Date();
    let gte: Date;

    switch (period) {
      case 'week':
        gte = new Date(now);
        gte.setDate(gte.getDate() - 7);
        break;
      case 'month':
        gte = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        gte = new Date(now);
        gte.setMonth(gte.getMonth() - 3);
        break;
      case 'year':
        gte = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
        return {};
      default:
        gte = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { gte };
  }
}
