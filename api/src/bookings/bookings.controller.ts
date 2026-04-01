import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ParseUUIDPipe } from '../common/pipes/parse-uuid.pipe';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking (public endpoint)' })
  @ApiResponse({ status: 201, description: 'Booking created' })
  @ApiResponse({ status: 404, description: 'Tattoo artist not found' })
  async create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all bookings for current user' })
  @ApiResponse({ status: 200, description: 'Paginated list of bookings' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.bookingsService.findAll({
      userId,
      page: page || 1,
      limit: limit || 20,
      status,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by ID (public, sanitized)' })
  @ApiResponse({ status: 200, description: 'Booking details' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.findByIdPublic(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update booking status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async updateStatus(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, userId, dto.status);
  }

  @Put(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm booking with deposit payment' })
  @ApiResponse({ status: 200, description: 'Booking confirmed' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async confirmBooking(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('paymentProof') paymentProof?: string,
  ) {
    return this.bookingsService.confirmBooking(id, userId, paymentProof);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  @ApiResponse({ status: 400, description: 'Cannot cancel completed booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancel(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingsService.cancel(id, userId);
  }
}
