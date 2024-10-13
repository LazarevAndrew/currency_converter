import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CurrencyController', () => {
  let currencyController: CurrencyController;
  let currencyService: CurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrencyController],
      providers: [
        {
          provide: CurrencyService,
          useValue: {
            convertCurrency: jest.fn().mockResolvedValue({ convertedAmount: 100 }),
          },
        },
      ],
    }).compile();

    currencyController = module.get<CurrencyController>(CurrencyController);
    currencyService = module.get<CurrencyService>(CurrencyService);
  });

  it('should be defined', () => {
    expect(currencyController).toBeDefined();
  });

  it('should return the converted amount when valid parameters are provided', async () => {
    const dto: ConvertCurrencyDto = { from: 978, to: 840, amount: 100 };
    const result = await currencyController.convertCurrency(dto);
    expect(result).toEqual({ convertedAmount: 100 });
    expect(currencyService.convertCurrency).toHaveBeenCalledWith(978, 840, 100);
  });

  it('should throw an error when missing parameters', async () => {
    const dto: ConvertCurrencyDto = { from: null, to: 840, amount: 100 };
    await expect(currencyController.convertCurrency(dto)).rejects.toThrow(
      new HttpException('Missing required parameters', HttpStatus.BAD_REQUEST),
    );
  });
});
