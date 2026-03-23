import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class UpdatePricingDto {
  @ApiProperty({ description: 'Price table entries [{width, height, price}]' })
  @IsArray()
  readonly priceTable: any[];

  @ApiProperty({
    description: 'Body location multipliers {location: multiplier}',
  })
  @IsObject()
  readonly bodyLocations: Record<string, number>;

  @ApiProperty({
    description: 'Shading option multipliers {type: multiplier}',
  })
  @IsObject()
  readonly shadingOptions: Record<string, number>;

  @ApiProperty({ description: 'Color option multipliers {type: multiplier}' })
  @IsObject()
  readonly colorOptions: Record<string, number>;

  @ApiProperty({
    description: 'Tattoo type multipliers {type: multiplier}',
  })
  @IsObject()
  readonly tattooTypes: Record<string, number>;

  @ApiPropertyOptional({ example: 480 })
  @IsNumber()
  @IsOptional()
  readonly maxDailyTime?: number;

  @ApiPropertyOptional({ example: 20, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  readonly depositPercentage?: number;

  @ApiPropertyOptional({ example: 150.0 })
  @IsNumber()
  @IsOptional()
  readonly miniPackPrice?: number;

  @ApiPropertyOptional({ example: 15.0 })
  @IsNumber()
  @IsOptional()
  readonly secondTattooDiscount?: number;
}
