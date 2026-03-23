import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsString,
} from 'class-validator';

export class CreateSpecialDateDto {
  @ApiProperty({ example: '2025-12-25' })
  @IsDateString()
  @IsNotEmpty()
  readonly date: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  readonly isBlocked?: boolean;

  @ApiPropertyOptional({ example: 'Christmas Day' })
  @IsString()
  @IsOptional()
  readonly notes?: string;
}
