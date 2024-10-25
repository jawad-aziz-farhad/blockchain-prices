import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Price } from 'src/entities/price.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import { MailService } from '../shared/services/mail.service';

@Injectable()
export class PriceAlertService {
  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    private readonly mailService: MailService,
  ) {}

  async checkPriceIncrease() {
    const chains = ['ethereum', 'polygon'];
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    for (const chain of chains) {
      const currentPrice = (
        await this.priceRepository.findOne({
          where: { chain },
          order: { createdAt: 'DESC' },
        })
      ).price;
      const oldPrice = (
        await this.priceRepository.findOne({
          where: { chain, createdAt: LessThanOrEqual(oneHourAgo) },
          order: { createdAt: 'DESC' },
        })
      ).price;

      if (oldPrice) {
        const increase = ((currentPrice - oldPrice) / oldPrice) * 100;

        if (increase > 3) {
          this.mailService.sendEmail(
            'hyperhire_assignment@hyperhire.in',
            `Price Increased for ${chain}`,
            `Price increased for ${chain} by 3%/`,
          );
        }
      }
    }
  }
}
