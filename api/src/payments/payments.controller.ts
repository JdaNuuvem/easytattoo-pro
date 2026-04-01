import { Controller, Post, Get, Body, Param, Headers, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('pix')
  @ApiOperation({ summary: 'Create a PIX payment' })
  async createPixPayment(
    @Body()
    body: {
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      value: number;
      description: string;
      artistId: string;
      bookingId?: string;
    },
  ) {
    return this.paymentsService.createPixPayment(body);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Check payment status' })
  async getPaymentStatus(@Param('id') id: string) {
    return this.paymentsService.getPaymentStatus(id);
  }

  @Post('webhook')
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Asaas webhook for payment notifications' })
  async handleWebhook(
    @Body() body: any,
    @Headers('asaas-access-token') webhookToken: string,
  ) {
    const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
    if (expectedToken && webhookToken !== expectedToken) {
      throw new UnauthorizedException('Invalid webhook token');
    }
    return this.paymentsService.handleWebhook(body);
  }
}
