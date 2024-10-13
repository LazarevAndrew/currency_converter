import { Controller, Post, Body, HttpException, HttpStatus, HttpCode } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';

@ApiTags('Currency Converter')
@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @ApiOperation({ summary: 'Convert currency' })
  @ApiResponse({ status: 200, description: 'Conversion successful.' })
  @ApiResponse({ status: 400, description: 'Invalid parameters.' })
  @ApiResponse({ status: 503, description: 'Service unavailable.' })
  @Post('convert')
  @HttpCode(200)
  async convertCurrency(@Body() convertCurrencyDto: ConvertCurrencyDto) {
    const { from, to, amount } = convertCurrencyDto;

    if (!from || !to || !amount) {
      throw new HttpException('Missing required parameters', HttpStatus.BAD_REQUEST);
    }

    const convertedAmount = await this.currencyService.convertCurrency(from, to, amount);
    return convertedAmount;
  }
}