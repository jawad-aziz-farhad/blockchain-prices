import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class SwapRateDto {
  @ApiProperty({
    description: 'The target amount',
    example: '8',
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
