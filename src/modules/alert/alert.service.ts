import { Injectable } from '@nestjs/common';
import { AlertDto } from '../../dtos/alert.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from '../../entities/alert.entity';
import { MailService } from '../shared/services/mail.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    private readonly mailerService: MailService,
  ) {}

  async setAlert(alertDto: AlertDto): Promise<Alert> {
    const alert = this.alertRepository.create(alertDto);
    await this.alertRepository.save(alert);

    return alert;
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkAlerts(): Promise<void> {
    const alerts = await this.alertRepository
      .createQueryBuilder('alert')
      .distinctOn(['alert.email'])
      .orderBy('alert.email')
      .addOrderBy('alert.createdAt', 'DESC')
      .getMany();

    for (const alert of alerts) {
      if (alert?.email)
        await this.sendAlertEmail(alert.email, alert.dollar, alert.chain);
    }
  }

  private async sendAlertEmail(
    email: string,
    dollar: number,
    chain: string,
  ): Promise<void> {
    await this.mailerService.sendEmail(
      email,
      `Price Alert for ${chain}`,
      `The price has reached or exceeded your alert threshold of $${dollar} for ${chain}.`,
    );
  }
}
