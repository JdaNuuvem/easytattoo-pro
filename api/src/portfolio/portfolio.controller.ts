import {
  Controller,
  Get,
  Post,
  Put,
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
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { ReorderPortfolioDto } from './dto/reorder-portfolio.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ParseUUIDPipe } from '../common/pipes/parse-uuid.pipe';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all portfolio items for current user' })
  @ApiResponse({ status: 200, description: 'All portfolio items' })
  async getMyPortfolio(@CurrentUser('id') userId: string) {
    return this.portfolioService.getMyPortfolio(userId);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get public portfolio by user ID (public)' })
  @ApiResponse({ status: 200, description: 'Public portfolio items' })
  async getByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.portfolioService.getByUserId(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new portfolio item' })
  @ApiResponse({ status: 201, description: 'Portfolio item created' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePortfolioDto,
  ) {
    return this.portfolioService.create(userId, dto);
  }

  @Put('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder portfolio items' })
  @ApiResponse({ status: 200, description: 'Portfolio reordered' })
  async reorder(
    @CurrentUser('id') userId: string,
    @Body() dto: ReorderPortfolioDto,
  ) {
    return this.portfolioService.reorder(userId, dto.orderedIds);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a portfolio item' })
  @ApiResponse({ status: 200, description: 'Portfolio item updated' })
  @ApiResponse({ status: 404, description: 'Portfolio item not found' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePortfolioDto,
  ) {
    return this.portfolioService.update(userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a portfolio item' })
  @ApiResponse({ status: 200, description: 'Portfolio item deleted' })
  @ApiResponse({ status: 404, description: 'Portfolio item not found' })
  async delete(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.portfolioService.delete(userId, id);
  }
}
