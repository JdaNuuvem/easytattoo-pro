import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post('whatsapp/booking-confirmation')
  @ApiOperation({ summary: 'Send booking confirmation via WhatsApp' })
  async sendBookingConfirmation(
    @Body()
    body: {
      bookingId: string;
      clientPhone: string;
      clientName: string;
      artistId: string;
      scheduledDate?: string;
      scheduledTime?: string;
      tattooType?: string;
      bodyLocation?: string;
    },
  ) {
    return this.notificationsService.sendWhatsAppBookingConfirmation(body);
  }

  @Post('whatsapp/test')
  @ApiOperation({ summary: 'Test WhatsApp connection' })
  async testWhatsApp(
    @Body()
    body: {
      evolutionApiUrl: string;
      evolutionApiKey: string;
      evolutionInstanceName: string;
      phone: string;
    },
  ) {
    return this.notificationsService.testWhatsApp(body);
  }

  @Post('email/test')
  @ApiOperation({ summary: 'Test email SMTP connection' })
  async testEmail(
    @Body()
    body: {
      smtpHost: string;
      smtpPort: number;
      smtpUser: string;
      smtpPass: string;
      smtpFrom: string;
    },
  ) {
    return this.notificationsService.testEmail(body);
  }
}
