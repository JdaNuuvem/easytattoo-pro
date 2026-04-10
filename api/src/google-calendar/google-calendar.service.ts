import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CalendarEvent {
  readonly summary: string;
  readonly description?: string;
  readonly startDateTime: string;
  readonly endDateTime: string;
  readonly location?: string;
}

interface GoogleTokens {
  readonly access_token: string;
  readonly refresh_token?: string;
  readonly expires_in?: number;
}

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Refreshes the Google access token using the stored refresh token.
   */
  private async refreshAccessToken(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { googleRefreshToken: true },
    });

    if (!user?.googleRefreshToken) {
      this.logger.warn(`No refresh token for user ${userId}`);
      return null;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      this.logger.warn('Google OAuth not configured');
      return null;
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: user.googleRefreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      this.logger.error(`Token refresh failed: ${(await response.text()).slice(0, 200)}`);
      return null;
    }

    const tokens: GoogleTokens = await response.json();

    await this.prisma.user.update({
      where: { id: userId },
      data: { googleAccessToken: tokens.access_token },
    });

    return tokens.access_token;
  }

  /**
   * Gets a valid access token for the user (refreshes if needed).
   */
  private async getAccessToken(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { googleAccessToken: true, googleRefreshToken: true },
    });

    if (!user?.googleAccessToken) {
      return null;
    }

    // Test if current token works
    const testResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary',
      { headers: { Authorization: `Bearer ${user.googleAccessToken}` } },
    );

    if (testResponse.ok) {
      return user.googleAccessToken;
    }

    // Token expired, try to refresh
    return this.refreshAccessToken(userId);
  }

  /**
   * Checks if a user has Google Calendar connected.
   */
  async isConnected(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { googleRefreshToken: true },
    });
    return !!user?.googleRefreshToken;
  }

  /**
   * Creates an event in the user's Google Calendar.
   */
  async createEvent(
    userId: string,
    event: CalendarEvent,
  ): Promise<string | null> {
    const accessToken = await this.getAccessToken(userId);
    if (!accessToken) {
      this.logger.warn(`Cannot create event: no token for user ${userId}`);
      return null;
    }

    const calendarId = await this.getCalendarId(userId);

    const body = {
      summary: event.summary,
      description: event.description || '',
      start: {
        dateTime: event.startDateTime,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: 'America/Sao_Paulo',
      },
      location: event.location,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'popup', minutes: 1440 },
        ],
      },
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      this.logger.error(`Failed to create event: ${(await response.text()).slice(0, 200)}`);
      return null;
    }

    const created = await response.json();
    return created.id;
  }

  /**
   * Updates an existing event in the user's Google Calendar.
   */
  async updateEvent(
    userId: string,
    eventId: string,
    event: Partial<CalendarEvent>,
  ): Promise<boolean> {
    const accessToken = await this.getAccessToken(userId);
    if (!accessToken) return false;

    const calendarId = await this.getCalendarId(userId);

    const body: any = {};
    if (event.summary) body.summary = event.summary;
    if (event.description !== undefined) body.description = event.description;
    if (event.startDateTime) {
      body.start = { dateTime: event.startDateTime, timeZone: 'America/Sao_Paulo' };
    }
    if (event.endDateTime) {
      body.end = { dateTime: event.endDateTime, timeZone: 'America/Sao_Paulo' };
    }
    if (event.location) body.location = event.location;

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      this.logger.error(`Failed to update event: ${(await response.text()).slice(0, 200)}`);
      return false;
    }

    return true;
  }

  /**
   * Deletes an event from the user's Google Calendar.
   */
  async deleteEvent(userId: string, eventId: string): Promise<boolean> {
    const accessToken = await this.getAccessToken(userId);
    if (!accessToken) return false;

    const calendarId = await this.getCalendarId(userId);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok && response.status !== 404) {
      this.logger.error(`Failed to delete event: ${(await response.text()).slice(0, 200)}`);
      return false;
    }

    return true;
  }

  /**
   * Connects Google Calendar for a user (stores tokens).
   */
  async connect(
    userId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: accessToken,
        ...(refreshToken ? { googleRefreshToken: refreshToken } : {}),
      },
    });
  }

  /**
   * Disconnects Google Calendar for a user.
   */
  async disconnect(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleCalendarId: null,
      },
    });
  }

  /**
   * Gets the calendar ID to use (custom or primary).
   */
  private async getCalendarId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { googleCalendarId: true },
    });
    return user?.googleCalendarId || 'primary';
  }

  /**
   * Syncs a booking to Google Calendar. Called when booking is created/confirmed.
   */
  async syncBookingToCalendar(bookingId: string): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        user: { select: { id: true, name: true } },
        studio: { select: { name: true, address: true } },
      },
    });

    if (!booking || !booking.scheduledDate) return;

    const connected = await this.isConnected(booking.userId);
    if (!connected) return;

    const startDate = new Date(booking.scheduledDate);
    if (booking.scheduledTime) {
      const [hours, minutes] = booking.scheduledTime.split(':').map(Number);
      startDate.setHours(hours, minutes, 0, 0);
    }

    const durationMinutes = booking.estimatedDuration || 120;
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    const summary = `Tattoo - ${booking.client.firstName} ${booking.client.lastName}`;
    const description = [
      `Cliente: ${booking.client.firstName} ${booking.client.lastName}`,
      `Telefone: ${booking.client.phone}`,
      booking.client.email ? `Email: ${booking.client.email}` : '',
      booking.client.instagram ? `Instagram: ${booking.client.instagram}` : '',
      `Tipo: ${booking.tattooType}`,
      `Tamanho: ${booking.tattooWidth}x${booking.tattooHeight}cm`,
      `Local do corpo: ${booking.bodyLocation}`,
      `Sombreamento: ${booking.shadingType}`,
      `Cor: ${booking.colorType}`,
      `Valor total: R$ ${booking.totalPrice.toFixed(2)}`,
      `Sinal: R$ ${booking.depositAmount.toFixed(2)}`,
      booking.description ? `Descricao: ${booking.description}` : '',
      `Status: ${booking.status}`,
    ]
      .filter(Boolean)
      .join('\n');

    const location = booking.studio
      ? `${booking.studio.name}${booking.studio.address ? ' - ' + booking.studio.address : ''}`
      : undefined;

    const event: CalendarEvent = {
      summary,
      description,
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      location,
    };

    if (booking.googleCalendarEventId) {
      // Update existing event
      await this.updateEvent(booking.userId, booking.googleCalendarEventId, event);
    } else {
      // Create new event
      const eventId = await this.createEvent(booking.userId, event);
      if (eventId) {
        await this.prisma.booking.update({
          where: { id: bookingId },
          data: { googleCalendarEventId: eventId },
        });
      }
    }
  }

  /**
   * Removes a booking from Google Calendar. Called when booking is cancelled.
   */
  async removeBookingFromCalendar(bookingId: string): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { userId: true, googleCalendarEventId: true },
    });

    if (!booking?.googleCalendarEventId) return;

    const deleted = await this.deleteEvent(
      booking.userId,
      booking.googleCalendarEventId,
    );

    if (deleted) {
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: { googleCalendarEventId: null },
      });
    }
  }

  /**
   * Syncs work schedule to Google Calendar as recurring blocked-time events.
   * Called when artist saves their work hours.
   */
  async syncWorkScheduleToCalendar(userId: string): Promise<void> {
    const connected = await this.isConnected(userId);
    if (!connected) return;

    const accessToken = await this.getAccessToken(userId);
    if (!accessToken) return;

    const calendarId = await this.getCalendarId(userId);

    const workSchedules = await this.prisma.workSchedule.findMany({
      where: { userId },
      orderBy: { dayOfWeek: 'asc' },
    });

    // Delete old recurring work-schedule events
    const existingEvents = await this.listWorkScheduleEvents(accessToken, calendarId);
    for (const ev of existingEvents) {
      await this.deleteEvent(userId, ev.id);
    }

    // Create new recurring events for each active work day
    const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

    // Find next occurrence of each day of week
    const now = new Date();
    for (const schedule of workSchedules) {
      if (!schedule.isAvailable) continue;

      const nextDate = this.getNextDayOfWeek(now, schedule.dayOfWeek);
      const dateStr = nextDate.toISOString().split('T')[0];

      const body = {
        summary: `Horario de Trabalho - EasyTattoo`,
        description: 'Horario de trabalho configurado no EasyTattoo Pro. Nao remova este evento.',
        start: {
          dateTime: `${dateStr}T${schedule.startTime}:00`,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: `${dateStr}T${schedule.endTime}:00`,
          timeZone: 'America/Sao_Paulo',
        },
        recurrence: [
          `RRULE:FREQ=WEEKLY;BYDAY=${dayMap[schedule.dayOfWeek]}`,
        ],
        transparency: 'opaque',
        colorId: '9', // blueberry
        extendedProperties: {
          private: {
            easytattoo: 'work-schedule',
          },
        },
      };

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        this.logger.error(
          `Failed to create work schedule event for day ${schedule.dayOfWeek}: ${(await response.text()).slice(0, 200)}`,
        );
      }
    }
  }

  /**
   * Lists existing work-schedule events from Google Calendar.
   */
  private async listWorkScheduleEvents(
    accessToken: string,
    calendarId: string,
  ): Promise<Array<{ id: string }>> {
    const params = new URLSearchParams({
      q: 'Horario de Trabalho - EasyTattoo',
      maxResults: '50',
      singleEvents: 'false',
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!response.ok) return [];

    const data = await response.json();
    return (data.items || [])
      .filter((item: any) =>
        item.extendedProperties?.private?.easytattoo === 'work-schedule',
      )
      .map((item: any) => ({ id: item.id }));
  }

  /**
   * Gets the next occurrence of a specific day of week.
   */
  private getNextDayOfWeek(from: Date, dayOfWeek: number): Date {
    const date = new Date(from);
    const diff = (dayOfWeek - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + (diff === 0 ? 0 : diff));
    return date;
  }

  /**
   * Gets the Google Calendar connection status for a user.
   */
  async getConnectionStatus(userId: string): Promise<{
    connected: boolean;
    email?: string;
    calendarId?: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleCalendarId: true,
      },
    });

    if (!user?.googleRefreshToken) {
      return { connected: false };
    }

    // Try to get calendar info
    const accessToken = await this.getAccessToken(userId);
    if (!accessToken) {
      return { connected: false };
    }

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!response.ok) {
      return { connected: false };
    }

    const calendar = await response.json();
    return {
      connected: true,
      email: calendar.id,
      calendarId: user.googleCalendarId || 'primary',
    };
  }
}
