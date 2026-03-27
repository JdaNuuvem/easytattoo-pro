import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async sendWhatsAppBookingConfirmation(data: {
    bookingId: string;
    clientPhone: string;
    clientName: string;
    artistId: string;
    scheduledDate?: string;
    scheduledTime?: string;
    tattooType?: string;
    bodyLocation?: string;
  }) {
    const artist = await this.prisma.user.findUnique({
      where: { id: data.artistId },
    });

    if (!artist?.evolutionApiUrl || !artist?.evolutionApiKey) {
      return { sent: false, reason: 'WhatsApp not configured' };
    }

    const message = [
      `Olá ${data.clientName}! 🎨`,
      `Seu agendamento de tatuagem foi confirmado!`,
      data.scheduledDate ? `📅 Data: ${data.scheduledDate}` : '',
      data.scheduledTime ? `⏰ Horário: ${data.scheduledTime}` : '',
      `Tatuador: ${artist.name}`,
      ``,
      `Qualquer dúvida, entre em contato!`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const phone = data.clientPhone.replace(/\D/g, '');
      const response = await fetch(
        `${artist.evolutionApiUrl}/message/sendText/${artist.evolutionInstanceName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: artist.evolutionApiKey,
          },
          body: JSON.stringify({
            number: `55${phone}`,
            text: message,
          }),
        },
      );

      return { sent: response.ok };
    } catch (error) {
      return { sent: false, reason: 'Failed to send' };
    }
  }

  async testWhatsApp(data: {
    evolutionApiUrl: string;
    evolutionApiKey: string;
    evolutionInstanceName: string;
    phone: string;
  }) {
    const phone = data.phone.replace(/\D/g, '');

    const response = await fetch(
      `${data.evolutionApiUrl}/message/sendText/${data.evolutionInstanceName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: data.evolutionApiKey,
        },
        body: JSON.stringify({
          number: `55${phone}`,
          text: '✅ Teste EasyTattoo Pro - WhatsApp conectado com sucesso!',
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Failed to send test message');
    }

    return { sent: true };
  }

  async testEmail(data: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    smtpFrom: string;
  }) {
    // Email test - would use nodemailer in production
    return { sent: true, message: 'Email test placeholder' };
  }
}
