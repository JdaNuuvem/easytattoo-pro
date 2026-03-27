import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleCallbackDto {
  @ApiProperty({ description: 'Authorization code from Google OAuth' })
  @IsString()
  @IsNotEmpty()
  readonly code: string;

  @ApiProperty({ description: 'Redirect URI used in the OAuth flow' })
  @IsString()
  @IsNotEmpty()
  readonly redirectUri: string;
}
