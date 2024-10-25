import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Price } from '../../entities/price.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import { MoralisApiService } from '../shared/services/moralis.service';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { MailService } from '../shared/services/mail.service';
import axios from 'axios';

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);
  private readonly FEE_PERCENTAGE = 0.03;

  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    private moralisApiService: MoralisApiService,
    private mailService: MailService,
  ) {}

  async getHourlyPricesLast24Hours(chain) {
    const date = new Date();
    date.setHours(date.getHours() - 24);

    return this.priceRepository
      .createQueryBuilder('price')
      .select("DATE_TRUNC('hour', price.createdAt)", 'hour')
      .addSelect('price.price', 'price')
      .addSelect('price.chain', 'chain')
      .where('price.createdAt >= :date', { date })
      .andWhere('price.chain = :chain', { chain })
      .andWhere(
        `price.id = (
        SELECT subPrice.id
        FROM price AS subPrice
        WHERE DATE_TRUNC('hour', subPrice."createdAt") = DATE_TRUNC('hour', price."createdAt") 
        AND subPrice."chain" = :chain
        ORDER BY subPrice."createdAt" DESC
        LIMIT 1
      )`,
      )
      .setParameter('chain', chain)
      .orderBy('hour', 'ASC')
      .getRawMany();
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async savePricesEveryFiveMinutes() {
    const ethPrice = await this.moralisApiService.getPrice(EvmChain.ETHEREUM);
    const polygonPrice = await this.moralisApiService.getPrice(
      EvmChain.POLYGON,
    );
    const priceData = [
      { chain: 'ethereum', price: ethPrice.usdPrice },
      { chain: 'polygon', price: polygonPrice.usdPrice },
    ];
    priceData.forEach(async (priceData) => {
      await this.priceRepository.save(priceData);

      const oneHourAgoPrice = await this.priceRepository.findOne({
        where: {
          chain: priceData.chain,
          createdAt: LessThanOrEqual(
            new Date(new Date().getTime() - 60 * 60 * 1000),
          ),
        },
        order: { createdAt: 'DESC' },
      });

      if (!oneHourAgoPrice || !oneHourAgoPrice.price) {
        this.logger.debug('NO PRICE FOUND');
        return;
      }

      const currentPrice = priceData.price;
      const oldPrice = oneHourAgoPrice.price;

      const increase = ((currentPrice - oldPrice) / oldPrice) * 100;

      if (increase > 3)
        if (oneHourAgoPrice.price > priceData.price) {
          // Sending Email to hyperhire_assignment@hyperhire.in
          await this.mailService.sendEmail(
            'hyperhire_assignment@hyperhire.in',
            `Price Alert for ${priceData.chain}`,
            `The price has reached for ${priceData.chain} is ${priceData.price}.`,
          );
        }
    });
    this.logger.debug('Saved Ethereum and Polygon prices to database');
  }

  async getSwapRate(amount: number): Promise<any> {
    const ethToBtcRate = await this.getExchangeRate();

    const btcAmount = amount * ethToBtcRate;

    const feeEth = amount * this.FEE_PERCENTAGE;
    const feeUsd = feeEth * ethToBtcRate;

    return {
      btcAmount,
      fee: {
        eth: feeEth,
        usd: feeUsd,
      },
    };
  }

  private async getExchangeRate(): Promise<number> {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd',
    );
    const ethPrice = response.data.ethereum.usd;
    const btcPrice = response.data.bitcoin.usd;

    return ethPrice / btcPrice;
  }
}
