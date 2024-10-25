import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Price } from 'src/entities/price.entity';
import { PriceController } from './price.controller';
import { PriceService } from './price.service';
import { PriceAlertService } from './price-alert.service';
import { SharedModule } from '../shared/services/shared.module';
import { MoralisApiService } from '../shared/services/moralis.service';
import { MailService } from '../shared/services/mail.service';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([Price])],
  controllers: [PriceController],
  providers: [PriceService, PriceAlertService, MoralisApiService, MailService],
})
export class PriceModule {}
