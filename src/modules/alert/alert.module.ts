import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../shared/services/shared.module';
import { Alert } from 'src/entities/alert.entity';
import { AlertService } from './alert.service';
import { MailService } from '../shared/services/mail.service';
import { AlertController } from './alert.controller';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([Alert])],
  controllers: [AlertController],
  providers: [AlertService, MailService],
})
export class AlertModule {}
