import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
} from 'class-validator';

export class UpdatePortfolioDto {
  @ApiPropertyOptional({ example: 'Dragon Sleeve' })
  @IsString()
  @IsOptional()
  readonly title?: string;

  @ApiPropertyOptional({ example: 'Full sleeve dragon design' })
  @IsString()
  @IsOptional()
  readonly description?: string;

  @ApiPropertyOptional({ example: 'Japanese' })
  @IsString()
  @IsOptional()
  readonly style?: string;

  @ApiPropertyOptional({ example: ['japanese', 'sleeve', 'dragon'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly tags?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  readonly isPublic?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  readonly order?: number;
}
