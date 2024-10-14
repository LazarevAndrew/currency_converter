import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class ConvertCurrencyDto {
  @ApiProperty({
    example: 840,
    description: 'Source currency code (e.g. USD: 840)',
  })
  @IsNumber()
  @IsNotEmpty()
  from: number;

  @ApiProperty({
    example: 980,
    description: 'Target currency code (e.g. UAH: 980)',
  })
  @IsNumber()
  @IsNotEmpty()
  to: number;

  @ApiProperty({ example: 100, description: 'Amount to convert' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
