import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
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
    },
  ) {
    return this.paymentsService.createPixPayment(body);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Check payment status' })
  async getPaymentStatus(@Param('id') id: string) {
    return this.paymentsService.getPaymentStatus(id);
  }
}
