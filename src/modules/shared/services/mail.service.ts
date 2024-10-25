import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(private readonly configService: ConfigService) {
    const SEND_GRID_API_KEY =
      this.configService.get<string>('SEND_GRID_API_KEY');
    sgMail.setApiKey(SEND_GRID_API_KEY);
  }

  async sendEmail(to: string, subject: string, text: string) {
    const msg = {
      to,
      from: this.configService.get<string>('SENDER_EMAIL'),
      subject,
      text,
    };

    try {
      await sgMail.send(msg);
      this.logger.debug('Email sent successfully.');
    } catch (error) {
      console.error('Error sending email: ', error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  }
}
