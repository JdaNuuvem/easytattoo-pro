import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsEmail,
  IsUUID,
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

export class CreateBookingDto {
  // Client info
  @ApiProperty({ example: 'Maria' })
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @ApiProperty({ example: 'Silva' })
  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @ApiProperty({ example: '+55 11 99999-9999' })
  @IsString()
  @IsNotEmpty()
  readonly phone: string;

  @ApiPropertyOptional({ example: 'maria@example.com' })
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @ApiPropertyOptional({ example: '@mariasilva' })
  @IsString()
  @IsOptional()
  readonly instagram?: string;

  // Tattoo artist (user) ID
  @ApiProperty({ description: 'Tattoo artist user ID' })
  @IsUUID()
  @IsNotEmpty()
  readonly userId: string;

  // Studio (optional)
  @ApiPropertyOptional({ description: 'Studio ID' })
  @IsUUID()
  @IsOptional()
  readonly studioId?: string;

  // Tattoo details
  @ApiProperty({ enum: TattooType })
  @IsEnum(TattooType)
  readonly tattooType: TattooType;

  @ApiProperty({ example: 10, description: 'Width in cm' })
  @IsNumber()
  @Min(1)
  readonly tattooWidth: number;

  @ApiProperty({ example: 10, description: 'Height in cm' })
  @IsNumber()
  @Min(1)
  readonly tattooHeight: number;

  @ApiProperty({ enum: ShadingType })
  @IsEnum(ShadingType)
  readonly shadingType: ShadingType;

  @ApiProperty({ enum: ColorType })
  @IsEnum(ColorType)
  readonly colorType: ColorType;

  @ApiProperty({ example: 'forearm' })
  @IsString()
  @IsNotEmpty()
  readonly bodyLocation: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  readonly hasCompanion?: boolean;

  @ApiPropertyOptional({ example: 'Small flower design' })
  @IsString()
  @IsOptional()
  readonly description?: string;

  @ApiPropertyOptional({ enum: PromotionType, default: 'NONE' })
  @IsEnum(PromotionType)
  @IsOptional()
  readonly promotion?: PromotionType;

  @ApiPropertyOptional({ example: '2025-03-15' })
  @IsDateString()
  @IsOptional()
  readonly scheduledDate?: string;

  @ApiPropertyOptional({ example: '14:00' })
  @IsString()
  @IsOptional()
  readonly scheduledTime?: string;

  @ApiPropertyOptional({ example: 60, description: 'Duration in minutes' })
  @IsNumber()
  @IsOptional()
  readonly estimatedDuration?: number;

  // Reference image URLs (already uploaded)
  @ApiPropertyOptional({ type: [String] })
  @IsString({ each: true })
  @IsOptional()
  readonly referenceImages?: string[];
}
