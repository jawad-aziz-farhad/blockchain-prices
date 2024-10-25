import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AlertDto {
  @ApiProperty({
    description: 'Chain value',
    example: 'ethereum',
  })
  @IsNotEmpty()
  @IsString()
  chain: string;

  @ApiProperty({
    description: 'The target dollar value (Should be Numeric value)',
    example: '50',
  })
  @IsNotEmpty()
  @IsNumber()
  dollar: number;

  @ApiProperty({
    description: 'The email to receive alerts.',
    example: 'recipient@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
