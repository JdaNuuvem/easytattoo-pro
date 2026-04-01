import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  Matches,
  Min,
  Max,
} from 'class-validator';

export class CreateWorkScheduleDto {
  @ApiPropertyOptional({ description: 'Studio ID' })
  @IsUUID()
  @IsOptional()
  readonly studioId?: string;

  @ApiProperty({
    example: 1,
    description: 'Day of week (0=Sunday, 6=Saturday)',
    minimum: 0,
    maximum: 6,
  })
  @IsNumber()
  @Min(0)
  @Max(6)
  readonly dayOfWeek: number;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be in HH:MM format (00:00-23:59)',
  })
  readonly startTime: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must be in HH:MM format (00:00-23:59)',
  })
  readonly endTime: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  readonly isAvailable?: boolean;
}
