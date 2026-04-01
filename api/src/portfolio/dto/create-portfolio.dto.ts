import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
  Matches,
} from 'class-validator';

export class CreatePortfolioDto {
  @ApiProperty({ example: '/uploads/portfolio/image.jpg' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\/uploads\/[a-zA-Z0-9._\/-]+|https:\/\/.+)$/, {
    message: 'imageUrl must be a valid upload path or HTTPS URL',
  })
  readonly imageUrl: string;

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

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  readonly isPublic?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @IsOptional()
  readonly order?: number;
}
