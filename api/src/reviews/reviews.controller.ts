import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a review for a completed booking (public)' })
  async create(@Body() body: { bookingId: string; rating: number; comment?: string }) {
    return this.reviewsService.create(body);
  }

  @Get('artist/:userId')
  @ApiOperation({ summary: 'Get all reviews for an artist (public)' })
  async getByArtist(@Param('userId') userId: string) {
    return this.reviewsService.getByArtist(userId);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get review for a specific booking' })
  async getByBooking(@Param('bookingId') bookingId: string) {
    return this.reviewsService.getByBooking(bookingId);
  }
}
