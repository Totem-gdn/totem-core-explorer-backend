import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { providers, utils, Wallet } from 'ethers';
import { GasStationPrices, GasStationPricesResponse } from './provider.interface';

@Injectable()
export class ProviderService implements OnApplicationBootstrap, OnApplicationShutdown {
  private logger = new Logger(ProviderService.name);
  private wallet: Wallet;
  private provider: providers.JsonRpcProvider;
  private intervalId: NodeJS.Timer;
  private abortController: AbortController;
  private gasStationUrl = '';
  private gasStationPrices: GasStationPrices;

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
    await this.fetchGasPrice(true);
    this.intervalId = setInterval(() => {
      this.abortController.abort();
      this.fetchGasPrice();
    }, 5 * 1000); // default block time is 5 sec
  }

  async onApplicationShutdown() {
    clearInterval(this.intervalId);
  }

  async fetchGasPrice(rethrow = false) {
    try {
      if (this.abortController) {
        this.abortController.abort();
      }
      const abortController = new AbortController();
      this.abortController = abortController;
      const response = await fetch(this.gasStationUrl, { signal: this.abortController.signal });
      if (!abortController.signal.aborted) {
        const { blockNumber, blockTime, estimatedBaseFee, fast }: GasStationPricesResponse = await response.json();
        this.gasStationPrices = {
          blockNumber,
          blockTime,
          estimatedBaseFee: utils.parseUnits(estimatedBaseFee.toFixed(9), 'gwei'),
          maxFeePerGas: utils.parseUnits(Math.ceil(fast.maxFee).toString(10), 'gwei').mul(2),
          maxPriorityFeePerGas: utils.parseUnits(Math.ceil(fast.maxPriorityFee).toString(10), 'gwei'),
        };
      }
    } catch (ex) {
      if (ex instanceof DOMException) {
        // AbortError https://github.com/nodejs/node/issues/38361
        this.logger.warn(`fetch gas prices request aborted`);
      } else if (ex instanceof Error) {
        this.logger.error(ex.message, ex.stack);
      } else {
        this.logger.error(ex);
      }
      if (rethrow) {
        throw ex;
      }
    }
  }

  getGasPrices() {
    return this.gasStationPrices;
  }

  getWallet() {
    return this.wallet;
  }

  getProvider() {
    return this.provider;
  }
}
