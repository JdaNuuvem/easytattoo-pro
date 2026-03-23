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
import { ScheduleService } from './schedule.service';
import { CreateWorkScheduleDto } from './dto/create-work-schedule.dto';
import { CreateSpecialDateDto } from './dto/create-special-date.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ParseUUIDPipe } from '../common/pipes/parse-uuid.pipe';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // Authenticated endpoint - must come BEFORE :userId to avoid "me" being parsed as UUID
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user schedule' })
  @ApiResponse({ status: 200, description: 'Work schedules and special dates' })
  async getMySchedule(@CurrentUser('id') userId: string) {
    return this.scheduleService.getByUserId(userId);
  }

  // Public endpoints
  @Get(':userId')
  @ApiOperation({ summary: 'Get schedule for a user (public)' })
  @ApiResponse({
    status: 200,
    description: 'Work schedules and special dates',
  })
  async getByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.scheduleService.getByUserId(userId);
  }

  @Get(':userId/available-slots')
  @ApiOperation({ summary: 'Get available time slots for a date (public)' })
  @ApiResponse({ status: 200, description: 'Available time slots' })
  @ApiQuery({ name: 'date', required: true, type: String })
  async getAvailableSlots(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('date') date: string,
  ) {
    return this.scheduleService.getAvailableSlots(userId, date);
  }

  // Protected: Work Hours CRUD
  @Post('work-hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a work schedule entry' })
  @ApiResponse({ status: 201, description: 'Work schedule created' })
  async createWorkSchedule(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWorkScheduleDto,
  ) {
    return this.scheduleService.createWorkSchedule(userId, dto);
  }

  @Put('work-hours/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a work schedule entry' })
  @ApiResponse({ status: 200, description: 'Work schedule updated' })
  @ApiResponse({ status: 404, description: 'Work schedule not found' })
  async updateWorkSchedule(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateWorkScheduleDto,
  ) {
    return this.scheduleService.updateWorkSchedule(userId, id, dto);
  }

  @Delete('work-hours/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a work schedule entry' })
  @ApiResponse({ status: 200, description: 'Work schedule deleted' })
  @ApiResponse({ status: 404, description: 'Work schedule not found' })
  async deleteWorkSchedule(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.scheduleService.deleteWorkSchedule(userId, id);
  }

  // Protected: Special Dates CRUD
  @Post('special-dates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a special date' })
  @ApiResponse({ status: 201, description: 'Special date created' })
  async createSpecialDate(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSpecialDateDto,
  ) {
    return this.scheduleService.createSpecialDate(userId, dto);
  }

  @Put('special-dates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a special date' })
  @ApiResponse({ status: 200, description: 'Special date updated' })
  @ApiResponse({ status: 404, description: 'Special date not found' })
  async updateSpecialDate(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSpecialDateDto,
  ) {
    return this.scheduleService.updateSpecialDate(userId, id, dto);
  }

  @Delete('special-dates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a special date' })
  @ApiResponse({ status: 200, description: 'Special date deleted' })
  @ApiResponse({ status: 404, description: 'Special date not found' })
  async deleteSpecialDate(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.scheduleService.deleteSpecialDate(userId, id);
  }
}
