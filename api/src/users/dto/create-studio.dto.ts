import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateStudioDto {
  @ApiProperty({ example: 'Ink Masters Studio' })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiPropertyOptional({ example: 'Rua das Flores, 123' })
  @IsString()
  @IsOptional()
  readonly address?: string;

  @ApiPropertyOptional({ example: 'Sao Paulo' })
  @IsString()
  @IsOptional()
  readonly city?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsString()
  @IsOptional()
  readonly state?: string;

  @ApiPropertyOptional({ example: '+55 11 99999-9999' })
  @IsString()
  @IsOptional()
  readonly phone?: string;
}
