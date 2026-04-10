import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkScheduleDto } from './dto/create-work-schedule.dto';
import { CreateSpecialDateDto } from './dto/create-special-date.dto';
import { GoogleCalendarService } from '../google-calendar/google-calendar.service';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly googleCalendarService: GoogleCalendarService,
  ) {}

  // Public: get work schedule for a user
  async getByUserId(userId: string) {
    const [user, workSchedules, specialDates] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { bookingDeadline: true },
      }),
      this.prisma.workSchedule.findMany({
        where: { userId },
        include: {
          studio: { select: { id: true, name: true } },
        },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      }),
      this.prisma.specialDate.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
      }),
    ]);

    return {
      workSchedules,
      specialDates,
      bookingDeadline: user?.bookingDeadline ?? '21:00',
    };
  }

  // Update booking deadline
  async updateBookingDeadline(userId: string, bookingDeadline: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { bookingDeadline },
      select: { bookingDeadline: true },
    });
  }

  // Public: get available time slots for a specific date
  async getAvailableSlots(userId: string, dateStr: string) {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();

    // Check if date is blocked
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    const specialDate = await this.prisma.specialDate.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (specialDate?.isBlocked) {
      return {
        date: dateStr,
        isBlocked: true,
        reason: specialDate.notes || 'Blocked date',
        slots: [],
      };
    }

    // Get work schedule for this day of week
    const workSchedules = await this.prisma.workSchedule.findMany({
      where: {
        userId,
        dayOfWeek,
        isAvailable: true,
      },
    });

    if (workSchedules.length === 0) {
      return {
        date: dateStr,
        isBlocked: false,
        reason: 'No work hours configured for this day',
        slots: [],
      };
    }

    // Get existing bookings for this date
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        userId,
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
        },
      },
      select: {
        scheduledTime: true,
        estimatedDuration: true,
      },
    });

    // Generate available slots (1-hour increments)
    const slots: Array<{
      time: string;
      available: boolean;
    }> = [];

    const timeFormat = /^([01]\d|2[0-3]):[0-5]\d$/;
    for (const schedule of workSchedules) {
      if (!timeFormat.test(schedule.startTime) || !timeFormat.test(schedule.endTime)) {
        throw new BadRequestException('Invalid time format in work schedule. Expected HH:MM.');
      }
      const [startH, startM] = schedule.startTime.split(':').map(Number);
      const [endH, endM] = schedule.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + (startM || 0);
      const endMinutes = endH * 60 + (endM || 0);

      for (let m = startMinutes; m < endMinutes; m += 60) {
        const hours = Math.floor(m / 60);
        const minutes = m % 60;
        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        // Check if slot conflicts with existing booking
        const isBooked = existingBookings.some((booking) => {
          if (!booking.scheduledTime) return false;
          const [bH, bM] = booking.scheduledTime.split(':').map(Number);
          const bookingStart = bH * 60 + (bM || 0);
          const bookingEnd = bookingStart + (booking.estimatedDuration || 60);
          const slotStart = m;
          const slotEnd = m + 60;
          return slotStart < bookingEnd && slotEnd > bookingStart;
        });

        slots.push({
          time: timeStr,
          available: !isBooked,
        });
      }
    }

    return {
      date: dateStr,
      isBlocked: false,
      reason: null,
      slots,
    };
  }

  // Work Schedule CRUD
  async createWorkSchedule(userId: string, dto: CreateWorkScheduleDto) {
    return this.prisma.workSchedule.create({
      data: {
        userId,
        studioId: dto.studioId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        isAvailable: dto.isAvailable ?? true,
      },
    });
  }

  async updateWorkSchedule(
    userId: string,
    scheduleId: string,
    dto: CreateWorkScheduleDto,
  ) {
    const schedule = await this.prisma.workSchedule.findFirst({
      where: { id: scheduleId, userId },
    });

    if (!schedule) {
      throw new NotFoundException('Work schedule not found');
    }

    return this.prisma.workSchedule.update({
      where: { id: scheduleId },
      data: {
        studioId: dto.studioId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        isAvailable: dto.isAvailable,
      },
    });
  }

  async deleteWorkSchedule(userId: string, scheduleId: string) {
    const schedule = await this.prisma.workSchedule.findFirst({
      where: { id: scheduleId, userId },
    });

    if (!schedule) {
      throw new NotFoundException('Work schedule not found');
    }

    return this.prisma.workSchedule.delete({
      where: { id: scheduleId },
    });
  }

  // Special Date CRUD
  async createSpecialDate(userId: string, dto: CreateSpecialDateDto) {
    return this.prisma.specialDate.create({
      data: {
        userId,
        date: new Date(dto.date),
        isBlocked: dto.isBlocked ?? true,
        notes: dto.notes,
      },
    });
  }

  async updateSpecialDate(
    userId: string,
    dateId: string,
    dto: CreateSpecialDateDto,
  ) {
    const specialDate = await this.prisma.specialDate.findFirst({
      where: { id: dateId, userId },
    });

    if (!specialDate) {
      throw new NotFoundException('Special date not found');
    }

    return this.prisma.specialDate.update({
      where: { id: dateId },
      data: {
        date: new Date(dto.date),
        isBlocked: dto.isBlocked,
        notes: dto.notes,
      },
    });
  }

  async deleteSpecialDate(userId: string, dateId: string) {
    const specialDate = await this.prisma.specialDate.findFirst({
      where: { id: dateId, userId },
    });

    if (!specialDate) {
      throw new NotFoundException('Special date not found');
    }

    return this.prisma.specialDate.delete({
      where: { id: dateId },
    });
  }

  // Sync work schedule to Google Calendar
  async syncWorkScheduleToGoogleCalendar(userId: string): Promise<{ synced: boolean }> {
    try {
      await this.googleCalendarService.syncWorkScheduleToCalendar(userId);
      return { synced: true };
    } catch (error) {
      this.logger.error(`Failed to sync work schedule to Google Calendar: ${error}`);
      return { synced: false };
    }
  }
}
