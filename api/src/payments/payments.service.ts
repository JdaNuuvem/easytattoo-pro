import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreatePixPaymentDto {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  value: number;
  description: string;
  artistId: string;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPixPayment(dto: CreatePixPaymentDto) {
    const asaasApiKey = process.env.ASAAS_API_KEY;
    const asaasUrl = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';

    if (!asaasApiKey) {
      throw new BadRequestException('Payment gateway not configured');
    }

    // Create or find customer in Asaas
    const customerResponse = await fetch(`${asaasUrl}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: asaasApiKey,
      },
      body: JSON.stringify({
        name: dto.customerName,
        email: dto.customerEmail,
        phone: dto.customerPhone,
        notificationDisabled: true,
      }),
    });

    const customer = await customerResponse.json();
    const customerId = customer.id || customer.data?.id;

    if (!customerId) {
      throw new BadRequestException('Failed to create payment customer');
    }

    // Create PIX payment
    const paymentResponse = await fetch(`${asaasUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: asaasApiKey,
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'PIX',
        value: dto.value,
        description: dto.description,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      }),
    });

    const payment = await paymentResponse.json();

    if (!payment.id) {
      throw new BadRequestException('Failed to create PIX payment');
    }

    // Get PIX QR Code
    const qrResponse = await fetch(
      `${asaasUrl}/payments/${payment.id}/pixQrCode`,
      {
        headers: { access_token: asaasApiKey },
      },
    );

    const qrData = await qrResponse.json();

    return {
      id: payment.id,
      pixQrCode: qrData.encodedImage || '',
      pixCopyPaste: qrData.payload || '',
      dueDate: payment.dueDate,
      value: payment.value,
    };
  }

  async getPaymentStatus(paymentId: string) {
    const asaasApiKey = process.env.ASAAS_API_KEY;
    const asaasUrl = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';

    if (!asaasApiKey) {
      throw new BadRequestException('Payment gateway not configured');
    }

    const response = await fetch(`${asaasUrl}/payments/${paymentId}`, {
      headers: { access_token: asaasApiKey },
    });

    const payment = await response.json();

    return { status: payment.status };
  }
}
