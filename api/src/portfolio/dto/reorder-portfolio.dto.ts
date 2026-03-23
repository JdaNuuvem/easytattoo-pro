import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class ReorderPortfolioDto {
  @ApiProperty({
    description: 'Ordered array of portfolio item IDs',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  readonly orderedIds: string[];
}
