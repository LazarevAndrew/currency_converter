import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

import { lastValueFrom } from 'rxjs';

@Injectable()
export class CurrencyService {
  private readonly cacheKey = 'exchange_rates';
  private readonly cacheTTL = parseInt(process.env.CACHE_TTL, 10) || 600;
  private readonly redis: Redis

  constructor(
    private readonly httpService: HttpService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  async getExchangeRates() {
    // Check if exchange rates are cached
    const cachedRates = await this.redis.get(this.cacheKey);
    if (cachedRates) {
      console.log("Taking from the cash")
      return JSON.parse(cachedRates);
    }

    // Fetch exchange rates from Monobank API if not cached
    try {
      const response = await lastValueFrom(this.httpService.get(process.env.MONOBANK_API_URL));
      const rates = response.data;
      console.log("Setting from the cash")

      // Cache the fetched exchange rates in Redis
      await this.redis.set(this.cacheKey, JSON.stringify(rates), 'EX', this.cacheTTL);

      return rates;
    } catch (error) {
      throw new HttpException('Failed to fetch exchange rates', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async convertCurrency(sourceCurrency: number, targetCurrency: number, amount: number) {
    const rates = await this.getExchangeRates();

    // Try to find direct conversion from sourceCurrency to targetCurrency
    let directRate = rates.find(
      (rate) =>
        rate.currencyCodeA === sourceCurrency &&
        rate.currencyCodeB === targetCurrency
    );

    // If directRate is available and has both rateBuy and rateSell, use it
    if (directRate && directRate.rateBuy && directRate.rateSell) {
      const convertedAmount = amount * directRate.rateSell;
      return { convertedAmount };
    }

    // If directRate is available but only has rateCross, use rateCross
    if (directRate && directRate.rateCross) {
      const convertedAmount = amount * directRate.rateCross;
      return { convertedAmount };
    }

    // Otherwise, we need to go through UAH (980) as an intermediate conversion

    // Convert from sourceCurrency to UAH (980)
    const toUAHRate = rates.find(
      (rate) =>
        rate.currencyCodeA === sourceCurrency && rate.currencyCodeB === 980
    );
    // If no rate is found for converting sourceCurrency to UAH, check cross rates
    if (!toUAHRate) {
      throw new HttpException(
        `Cannot convert from ${sourceCurrency} to UAH`,
        HttpStatus.BAD_REQUEST
      );
    }

    const amountInUAH = toUAHRate.rateSell
      ? amount * toUAHRate.rateSell
      : amount * toUAHRate.rateCross; // Use rateCross if rateSell isn't available

    // Now convert from UAH to targetCurrency
    const fromUAHRate = rates.find(
      (rate) =>
        rate.currencyCodeA === 980 && rate.currencyCodeB.toString() === targetCurrency
    );

    if (!fromUAHRate) {
      throw new HttpException(
        `Cannot convert from UAH to ${targetCurrency}`,
        HttpStatus.BAD_REQUEST
      );
    }

    const convertedAmount = fromUAHRate.rateBuy
      ? amountInUAH / fromUAHRate.rateBuy
      : amountInUAH * fromUAHRate.rateCross; // Use rateCross if rateBuy isn't available


    return { convertedAmount };
  }
}
