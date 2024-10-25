import { Module } from '@nestjs/common';
import { MoralisApiService } from './moralis.service';
import { MailService } from '@sendgrid/mail';

@Module({
  imports: [],
  providers: [MoralisApiService, MailService],
})
export class SharedModule {}
