import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsUUID,
  IsOptional,
  Min,
} from 'class-validator';

enum TattooType {
  DRAWING = 'DRAWING',
  TEXT = 'TEXT',
  CLOSURE = 'CLOSURE',
}

enum ShadingType {
  NONE = 'NONE',
  LIGHT = 'LIGHT',
  MEDIUM = 'MEDIUM',
  REALISM = 'REALISM',
}

enum ColorType {
  BLACK = 'BLACK',
  ONE_COLOR = 'ONE_COLOR',
  TWO_COLORS = 'TWO_COLORS',
  THREE_COLORS = 'THREE_COLORS',
}

enum PromotionType {
  NONE = 'NONE',
  MINI_PACK = 'MINI_PACK',
  SECOND_TATTOO = 'SECOND_TATTOO',
}

export class CalculatePriceDto {
  @ApiProperty({ description: 'Tattoo artist user ID' })
  @IsUUID()
  @IsNotEmpty()
  readonly userId: string;

  @ApiProperty({ enum: TattooType })
  @IsEnum(TattooType)
  readonly tattooType: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  readonly tattooWidth: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  readonly tattooHeight: number;

  @ApiProperty({ enum: ShadingType })
  @IsEnum(ShadingType)
  readonly shadingType: string;

  @ApiProperty({ enum: ColorType })
  @IsEnum(ColorType)
  readonly colorType: string;

  @ApiProperty({ example: 'forearm' })
  @IsString()
  @IsNotEmpty()
  readonly bodyLocation: string;

  @ApiPropertyOptional({ enum: PromotionType, default: 'NONE' })
  @IsEnum(PromotionType)
  @IsOptional()
  readonly promotion?: string;
}
