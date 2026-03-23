import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateStudioDto } from './dto/create-studio.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ParseUUIDPipe } from '../common/pipes/parse-uuid.pipe';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/public')
  @ApiOperation({ summary: 'Get public artist profile by ID' })
  @ApiResponse({ status: 200, description: 'Public artist profile' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  async getPublicProfile(@Param('id', ParseUUIDPipe) userId: string) {
    return this.usersService.getPublicProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    const user = await this.usersService.findById(userId);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  // Studio CRUD
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('studios')
  @ApiOperation({ summary: 'List all studios for current user' })
  @ApiResponse({ status: 200, description: 'List of studios' })
  async getStudios(@CurrentUser('id') userId: string) {
    return this.usersService.getStudios(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('studios')
  @ApiOperation({ summary: 'Create a new studio' })
  @ApiResponse({ status: 201, description: 'Studio created' })
  async createStudio(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateStudioDto,
  ) {
    return this.usersService.createStudio(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('studios/:id')
  @ApiOperation({ summary: 'Update a studio' })
  @ApiResponse({ status: 200, description: 'Studio updated' })
  @ApiResponse({ status: 404, description: 'Studio not found' })
  async updateStudio(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) studioId: string,
    @Body() dto: CreateStudioDto,
  ) {
    return this.usersService.updateStudio(userId, studioId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('studios/:id')
  @ApiOperation({ summary: 'Delete a studio' })
  @ApiResponse({ status: 200, description: 'Studio deleted' })
  @ApiResponse({ status: 404, description: 'Studio not found' })
  async deleteStudio(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) studioId: string,
  ) {
    return this.usersService.deleteStudio(userId, studioId);
  }
}
