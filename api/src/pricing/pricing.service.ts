import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { calculateTattooPrice } from './calculator';

interface CalculatePriceInput {
  readonly userId: string;
  readonly tattooType: string;
  readonly tattooWidth: number;
  readonly tattooHeight: number;
  readonly shadingType: string;
  readonly colorType: string;
  readonly bodyLocation: string;
  readonly promotion: string;
}

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async getByUserId(userId: string) {
    const config = await this.prisma.pricingConfig.findUnique({
      where: { userId },
    });

    if (!config) {
      throw new NotFoundException('Pricing config not found for this user');
    }

    return config;
  }

  async getMyPricing(userId: string) {
    let config = await this.prisma.pricingConfig.findUnique({
      where: { userId },
    });

    // Auto-create default config if none exists
    if (!config) {
      config = await this.prisma.pricingConfig.create({
        data: {
          userId,
          priceTable: [],
          bodyLocations: {},
          shadingOptions: {},
          colorOptions: {},
          tattooTypes: {},
        },
      });
    }

    return config;
  }

  async updatePricing(userId: string, dto: UpdatePricingDto) {
    const existing = await this.prisma.pricingConfig.findUnique({
      where: { userId },
    });

    if (existing) {
      return this.prisma.pricingConfig.update({
        where: { userId },
        data: {
          priceTable: dto.priceTable as any,
          bodyLocations: dto.bodyLocations as any,
          shadingOptions: dto.shadingOptions as any,
          colorOptions: dto.colorOptions as any,
          tattooTypes: dto.tattooTypes as any,
          maxDailyTime: dto.maxDailyTime ?? existing.maxDailyTime,
          depositPercentage:
            dto.depositPercentage ?? existing.depositPercentage,
          miniPackPrice: dto.miniPackPrice ?? existing.miniPackPrice,
          secondTattooDiscount:
            dto.secondTattooDiscount ?? existing.secondTattooDiscount,
        },
      });
    }

    return this.prisma.pricingConfig.create({
      data: {
        userId,
        priceTable: dto.priceTable as any,
        bodyLocations: dto.bodyLocations as any,
        shadingOptions: dto.shadingOptions as any,
        colorOptions: dto.colorOptions as any,
        tattooTypes: dto.tattooTypes as any,
        maxDailyTime: dto.maxDailyTime,
        depositPercentage: dto.depositPercentage,
        miniPackPrice: dto.miniPackPrice,
        secondTattooDiscount: dto.secondTattooDiscount,
      },
    });
  }

  async calculatePrice(input: CalculatePriceInput) {
    const config = await this.prisma.pricingConfig.findUnique({
      where: { userId: input.userId },
    });

    if (!config) {
      throw new NotFoundException(
        'Pricing configuration not found for this artist',
      );
    }

    const priceTable = config.priceTable as any[];
    const bodyLocations = config.bodyLocations as Record<string, number>;
    const shadingOptions = config.shadingOptions as Record<string, number>;
    const colorOptions = config.colorOptions as Record<string, number>;
    const tattooTypes = config.tattooTypes as Record<string, number>;

    return calculateTattooPrice({
      priceTable,
      bodyLocations,
      shadingOptions,
      colorOptions,
      tattooTypes,
      depositPercentage: config.depositPercentage,
      miniPackPrice: config.miniPackPrice,
      secondTattooDiscount: config.secondTattooDiscount,
      tattooWidth: input.tattooWidth,
      tattooHeight: input.tattooHeight,
      bodyLocation: input.bodyLocation,
      shadingType: input.shadingType,
      colorType: input.colorType,
      tattooType: input.tattooType,
      promotion: input.promotion,
    });
  }
}
