import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyService } from './currency.service';
import { HttpService } from '@nestjs/axios';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { of } from 'rxjs';
import { Redis } from 'ioredis'; // For Redis client typing

describe('CurrencyService', () => {
  let currencyService: CurrencyService;
  let httpService: HttpService;
  let redisService: RedisService;
  let redisClient: Redis;

  beforeEach(async () => {
    // Mock Redis client (ioredis)
    redisClient = {
      get: jest.fn(),
      set: jest.fn(),
    } as unknown as Redis;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue(redisClient),
          },
        },
      ],
    }).compile();

    currencyService = module.get<CurrencyService>(CurrencyService);
    httpService = module.get<HttpService>(HttpService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(currencyService).toBeDefined();
  });

  it('should fetch exchange rates from the API and return a converted amount', async () => {
    const mockApiResponse = [
      { currencyCodeA: 978, currencyCodeB: 840, rateBuy: 1.1, rateSell: 1.089 },
    ];

    jest.spyOn(httpService, 'get').mockReturnValue(of({ data: mockApiResponse } as any));

    const result = await currencyService.convertCurrency(978, 840, 100);
    expect(result).toEqual({ convertedAmount: 108.89999999999999 });
  });

  it('should return a cached result if available in Redis', async () => {
    const mockCachedResponse = '[{"currencyCodeA":978,"currencyCodeB":840,"rateBuy":1.1,"rateSell":1.089}]';

    jest.spyOn(redisClient, 'get').mockResolvedValue(mockCachedResponse);

    const result = await currencyService.convertCurrency(978, 840, 100);
    expect(result).toEqual({ convertedAmount: 108.89999999999999 });
  });

  it('should set exchange rates in Redis after fetching from API', async () => {
    const mockApiResponse = [
      { currencyCodeA: 978, currencyCodeB: 840, rateBuy: 1.1, rateSell: 1.089 },
    ];

    jest.spyOn(httpService, 'get').mockReturnValue(of({ data: mockApiResponse } as any));

    jest.spyOn(redisClient, 'set').mockResolvedValue('OK');

    await currencyService.convertCurrency(978, 840, 100);

    expect(redisClient.set).toHaveBeenCalledWith(
      'exchange_rates',
      JSON.stringify(mockApiResponse),
      'EX',
      600,
    );
  });
});
