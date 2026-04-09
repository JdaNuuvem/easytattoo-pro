import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  readonly name?: string;

  @ApiPropertyOptional({ example: '+55 11 99999-9999' })
  @IsString()
  @IsOptional()
  readonly phone?: string;

  @ApiPropertyOptional({ example: '@johntattoo' })
  @IsString()
  @IsOptional()
  readonly instagram?: string;

  @ApiPropertyOptional({ example: 'Tattoo artist since 2015' })
  @IsString()
  @IsOptional()
  readonly bio?: string;

  @ApiPropertyOptional({ example: 20, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  readonly depositPercentage?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  readonly acceptsCompanion?: boolean;

  @ApiPropertyOptional({ example: 8, minimum: 1, maximum: 24 })
  @IsNumber()
  @Min(1)
  @Max(24)
  @IsOptional()
  readonly maxDailyHours?: number;
}
