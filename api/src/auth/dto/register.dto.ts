import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export enum RegisterRole {
  ARTIST = 'ARTIST',
  CLIENT = 'CLIENT',
}

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ example: 'securePassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  readonly password: string;

  @ApiPropertyOptional({ enum: RegisterRole, default: RegisterRole.ARTIST })
  @IsEnum(RegisterRole, { message: 'Role must be ARTIST or CLIENT' })
  @IsOptional()
  readonly role?: RegisterRole;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsString()
  @IsOptional()
  readonly phone?: string;
}
