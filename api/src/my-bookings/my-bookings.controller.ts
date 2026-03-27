import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MyBookingsService } from './my-bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ParseUUIDPipe } from '../common/pipes/parse-uuid.pipe';

@ApiTags('My Bookings')
@Controller('my-bookings')
export class MyBookingsController {
  constructor(private readonly myBookingsService: MyBookingsService) {}

  @Get('by-phone')
  @ApiOperation({ summary: 'Look up bookings by phone number (no auth required)' })
  @ApiResponse({ status: 200, description: 'Bookings for the given phone' })
  async findByPhone(@Query('phone') phone: string) {
    return this.myBookingsService.findByPhone(phone);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all bookings for the logged-in client' })
  @ApiResponse({ status: 200, description: 'Client bookings list' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.myBookingsService.findAll(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking details for the logged-in client' })
  @ApiResponse({ status: 200, description: 'Booking details' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findById(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.myBookingsService.findById(userId, id);
  }
}
