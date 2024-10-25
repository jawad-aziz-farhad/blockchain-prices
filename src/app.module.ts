import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Price } from './entities/price.entity';
import { Alert } from './entities/alert.entity';
import { PriceModule } from './modules/price/price.module';
import { SharedModule } from './modules/shared/services/shared.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AlertModule } from './modules/alert/alert.module';

const envFilePath = (() => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'env/.env.prod';
    case 'testing':
      return 'env/.env.test';
    case 'development':
    default:
      return 'env/.env.dev';
  }
})();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', envFilePath),
    }),
    PriceModule,
    AlertModule,
    SharedModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: +configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        autoLoadEntities: true,
        entities: [Price, Alert],
        synchronize: true,
      }),
    }),
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
