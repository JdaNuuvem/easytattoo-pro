import { Module } from '@nestjs/common';
import { MyBookingsController } from './my-bookings.controller';
import { MyBookingsService } from './my-bookings.service';

@Module({
  controllers: [MyBookingsController],
  providers: [MyBookingsService],
})
export class MyBookingsModule {}
