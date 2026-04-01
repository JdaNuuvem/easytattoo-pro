import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private validateExternalUrl(url: string): void {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();
      const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1', 'metadata.google.internal'];
      if (
        blocked.includes(hostname) ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('172.16.') ||
        hostname.startsWith('172.17.') ||
        hostname.startsWith('172.18.') ||
        hostname.startsWith('172.19.') ||
        hostname.startsWith('172.2') ||
        hostname.startsWith('172.30.') ||
        hostname.startsWith('172.31.') ||
        hostname.endsWith('.internal') ||
        hostname.endsWith('.local')
      ) {
        throw new Error('Blocked host');
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('Invalid URL');
    }
  }

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

    this.validateExternalUrl(artist.evolutionApiUrl);

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
    this.validateExternalUrl(data.evolutionApiUrl);

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
    try {
      const transporter = nodemailer.createTransport({
        host: data.smtpHost,
        port: data.smtpPort,
        secure: data.smtpPort === 465,
        auth: {
          user: data.smtpUser,
          pass: data.smtpPass,
        },
      });

      await transporter.verify();
      return { sent: true, message: 'SMTP connection verified' };
    } catch (error) {
      this.logger.error('Email test failed', error);
      return { sent: false, message: 'SMTP connection failed' };
    }
  }

  async sendBookingConfirmationEmail(data: {
    artistId: string;
    clientEmail: string;
    clientName: string;
    bookingId: string;
    scheduledDate?: string;
    scheduledTime?: string;
    totalPrice?: number;
    depositAmount?: number;
  }) {
    const artist = await this.prisma.user.findUnique({
      where: { id: data.artistId },
    });

    if (!artist?.smtpHost || !artist?.smtpUser || !artist?.smtpPass) {
      this.logger.warn(`Email not configured for artist ${data.artistId}`);
      return { sent: false, reason: 'Email not configured' };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: artist.smtpHost,
        port: artist.smtpPort || 587,
        secure: artist.smtpPort === 465,
        auth: {
          user: artist.smtpUser,
          pass: artist.smtpPass,
        },
      });

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c9a96e;">EasyTattoo Pro - Confirmação de Agendamento</h2>
          <p>Olá <strong>${data.clientName}</strong>,</p>
          <p>Seu agendamento de tatuagem foi confirmado!</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Tatuador:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${artist.name}</td></tr>
            ${data.scheduledDate ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Data:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.scheduledDate}</td></tr>` : ''}
            ${data.scheduledTime ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Horário:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.scheduledTime}</td></tr>` : ''}
            ${data.totalPrice ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Valor Total:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">R$ ${data.totalPrice.toFixed(2)}</td></tr>` : ''}
            ${data.depositAmount ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Sinal:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">R$ ${data.depositAmount.toFixed(2)}</td></tr>` : ''}
          </table>
          <p>Qualquer dúvida, entre em contato!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #888; font-size: 12px;">EasyTattoo Pro - Sistema profissional para tatuadores</p>
        </div>
      `;

      await transporter.sendMail({
        from: artist.smtpFrom || artist.smtpUser,
        to: data.clientEmail,
        subject: `Confirmação de Agendamento - ${artist.name}`,
        html,
      });

      return { sent: true };
    } catch (error) {
      this.logger.error('Failed to send booking confirmation email', error);
      return { sent: false, reason: 'Failed to send email' };
    }
  }

  async sendPasswordResetEmail(email: string, resetUrl: string) {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn('Global SMTP not configured for password reset');
      return { sent: false, reason: 'SMTP not configured' };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c9a96e;">EasyTattoo Pro - Redefinição de Senha</h2>
          <p>Você solicitou a redefinição da sua senha.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #c9a96e; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Redefinir Senha
            </a>
          </div>
          <p style="color: #888; font-size: 13px;">Este link expira em 1 hora.</p>
          <p style="color: #888; font-size: 13px;">Se você não solicitou esta redefinição, ignore este email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #888; font-size: 12px;">EasyTattoo Pro - Sistema profissional para tatuadores</p>
        </div>
      `;

      await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: 'EasyTattoo Pro - Redefinição de Senha',
        html,
      });

      return { sent: true };
    } catch (error) {
      this.logger.error('Failed to send password reset email', error);
      return { sent: false, reason: 'Failed to send email' };
    }
  }
}
