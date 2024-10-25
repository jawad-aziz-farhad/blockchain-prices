import { Body, Controller, Post } from '@nestjs/common';
import { AlertDto } from 'src/dtos/alert.dto';
import { AlertService } from './alert.service';

@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}
  @Post('price-alert')
  async setAlert(@Body() alertDto: AlertDto) {
    return this.alertService.setAlert(alertDto);
  }
}
