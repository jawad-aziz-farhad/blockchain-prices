import { EvmChain } from '@moralisweb3/common-evm-utils';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class MoralisApiService {
  constructor(private readonly configService: ConfigService) {}

  async getPrice(chain) {
    try {
      const token =
        chain._value === EvmChain.ETHEREUM.apiHex
          ? '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
          : '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0';
      const ethPrice = (
        await axios.get(
          `https://deep-index.moralis.io/api/v2/erc20/${token}/price`,
          {
            headers: {
              'X-API-Key': this.configService.get<string>('MORALIS_API_KEY'),
            },
          },
        )
      ).data;
      return ethPrice;
    } catch (error) {
      console.error('Error fetching Ethereum price:', error);
    }
  }
}
