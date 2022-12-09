import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BigNumber, providers, utils, Wallet } from 'ethers';

type GasStationPrices = {
  safeLow: {
    maxPriorityFee: BigNumber;
    maxFee: BigNumber;
  };
  standard: {
    maxPriorityFee: BigNumber;
    maxFee: BigNumber;
  };
  fast: {
    maxPriorityFee: BigNumber;
    maxFee: BigNumber;
  };
  estimatedBaseFee: BigNumber;
  blockTime: number;
  blockNumber: number;
};

type GasStationPricesResponse = {
  safeLow: {
    maxPriorityFee: number;
    maxFee: number;
  };
  standard: {
    maxPriorityFee: number;
    maxFee: number;
  };
  fast: {
    maxPriorityFee: number;
    maxFee: number;
  };
  estimatedBaseFee: number;
  blockTime: number;
  blockNumber: number;
};

@Injectable()
export class ProviderService implements OnApplicationBootstrap, OnApplicationShutdown {
  private logger = new Logger(ProviderService.name);
  private wallet: Wallet;
  private provider: providers.JsonRpcProvider;
  private intervalId: NodeJS.Timer;
  private gasStationUrl = '';
  private prices: GasStationPrices;

  constructor(private config: ConfigService) {}

  async onApplicationBootstrap() {
    this.provider = new providers.JsonRpcProvider(this.config.get<string>('PROVIDER_URL'));
    this.wallet = new Wallet(this.config.get<string>('PROVIDER_PRIVATE_KEY'), this.provider);
    const network = await this.provider.getNetwork();
    switch (network.chainId) {
      case 137: // Polygon mainnet
        this.gasStationUrl = 'https://gasstation-mainnet.matic.network/v2';
        break;
      case 80001: // Polygon mumbai
        this.gasStationUrl = 'https://gasstation-mumbai.matic.today/v2';
        break;
      default:
        throw new Error(`invalid provider network: name ${network.name}, chainId ${network.chainId}`);
    }
    await this.fetchGasPrice();
    this.intervalId = setInterval(() => this.fetchGasPrice(), this.prices.blockTime * 1000);
  }

  async onApplicationShutdown() {
    clearInterval(this.intervalId);
  }

  async fetchGasPrice() {
    try {
      const response = await fetch(this.gasStationUrl);
      const { blockNumber, blockTime, estimatedBaseFee, safeLow, standard, fast }: GasStationPricesResponse =
        await response.json();
      this.prices = {
        blockNumber,
        blockTime,
        estimatedBaseFee: utils.parseUnits(estimatedBaseFee.toString(10), 'gwei'),
        safeLow: {
          maxFee: utils.parseUnits(Math.ceil(safeLow.maxFee).toString(10), 'gwei'),
          maxPriorityFee: utils.parseUnits(Math.ceil(safeLow.maxPriorityFee).toString(10), 'gwei'),
        },
        standard: {
          maxFee: utils.parseUnits(Math.ceil(standard.maxFee).toString(10), 'gwei'),
          maxPriorityFee: utils.parseUnits(Math.ceil(standard.maxPriorityFee).toString(10), 'gwei'),
        },
        fast: {
          maxFee: utils.parseUnits(Math.ceil(fast.maxFee).toString(10), 'gwei'),
          maxPriorityFee: utils.parseUnits(Math.ceil(fast.maxPriorityFee).toString(10), 'gwei'),
        },
      };
    } catch (ex) {
      if (ex instanceof Error) {
        this.logger.error(ex.message, ex.stack);
      } else {
        this.logger.error(ex);
      }
    }
  }

  getGasPrices() {
    return this.prices;
  }

  getStandardGasPrice() {
    return this.prices.standard;
  }

  getSlowGasPrice() {
    return this.prices.safeLow;
  }

  getFastGasPrice() {
    return this.prices.fast;
  }

  getWallet() {
    return this.wallet;
  }

  getProvider() {
    return this.provider;
  }
}
