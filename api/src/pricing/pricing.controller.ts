import {
  Controller,
  Get,
  Put,
  Post,
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
import { PricingService } from './pricing.service';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ParseUUIDPipe } from '../common/pipes/parse-uuid.pipe';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user pricing config' })
  @ApiResponse({ status: 200, description: 'My pricing configuration' })
  async getMyPricing(@CurrentUser('id') userId: string) {
    return this.pricingService.getMyPricing(userId);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get pricing config by user ID (public)' })
  @ApiResponse({ status: 200, description: 'Pricing configuration' })
  @ApiResponse({ status: 404, description: 'Config not found' })
  async getByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.pricingService.getByUserId(userId);
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ARTIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user pricing config' })
  @ApiResponse({ status: 200, description: 'Pricing updated' })
  async updatePricing(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePricingDto,
  ) {
    return this.pricingService.updatePricing(userId, dto);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate tattoo price (public)' })
  @ApiResponse({ status: 200, description: 'Price calculation result' })
  @ApiResponse({ status: 404, description: 'Pricing config not found' })
  async calculatePrice(@Body() dto: CalculatePriceDto) {
    return this.pricingService.calculatePrice({
      userId: dto.userId,
      tattooType: dto.tattooType,
      tattooWidth: dto.tattooWidth,
      tattooHeight: dto.tattooHeight,
      shadingType: dto.shadingType,
      colorType: dto.colorType,
      bodyLocation: dto.bodyLocation,
      promotion: dto.promotion || 'NONE',
    });
  }
}
