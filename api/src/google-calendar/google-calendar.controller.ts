import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GoogleCalendarService } from './google-calendar.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Google Calendar')
@Controller('google-calendar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoogleCalendarController {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Get Google Calendar connection status' })
  @ApiResponse({ status: 200, description: 'Connection status' })
  async getStatus(@CurrentUser('id') userId: string) {
    return this.googleCalendarService.getConnectionStatus(userId);
  }

  @Post('connect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connect Google Calendar' })
  @ApiResponse({ status: 200, description: 'Calendar connected' })
  async connect(
    @CurrentUser('id') userId: string,
    @Body() body: { accessToken: string; refreshToken?: string },
  ) {
    await this.googleCalendarService.connect(
      userId,
      body.accessToken,
      body.refreshToken,
    );
    return { connected: true };
  }

  @Delete('disconnect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect Google Calendar' })
  @ApiResponse({ status: 200, description: 'Calendar disconnected' })
  async disconnect(@CurrentUser('id') userId: string) {
    await this.googleCalendarService.disconnect(userId);
    return { connected: false };
  }
}
