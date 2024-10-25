import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { PriceService } from './price.service';
import { MoralisApiService } from '../shared/services/moralis.service';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { SwapRateDto } from 'src/dtos/swap-rate.dto';

@Controller('prices')
export class PriceController {
  constructor(
    private priceService: PriceService,
    private moralisApiService: MoralisApiService,
  ) {}

  @Get('hourly')
  async getHourlyPrices(@Query('chain') chain: string) {
    if (!chain) {
      throw new Error('Chain parameter is required');
    }
    return this.priceService.getHourlyPricesLast24Hours(chain);
  }

  @Get('price/:chain')
  async getEthereumPrices(@Param('chain') chain, @Res() res) {
    chain = chain === 'ethereum' ? EvmChain.ETHEREUM : EvmChain.POLYGON;
    const response = await this.moralisApiService.getPrice(chain);
    res.status(200).send(response);
  }

  @Post('swap-rate')
  async getSwapRate(@Body() swapRateDto: SwapRateDto) {
    const { amount } = swapRateDto;
    return this.priceService.getSwapRate(amount);
  }
}
