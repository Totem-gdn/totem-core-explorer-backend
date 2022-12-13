import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { providers, Wallet } from 'ethers';

@Injectable()
export class ProviderService implements OnApplicationBootstrap, OnApplicationShutdown {
  private wallet: Wallet;
  private provider: providers.JsonRpcProvider;
  private intervalId: NodeJS.Timer;

  constructor(private config: ConfigService) {}

  async onApplicationBootstrap() {
    this.provider = new providers.JsonRpcProvider(this.config.get<string>('PROVIDER_URL'));
    this.wallet = new Wallet(this.config.get<string>('PROVIDER_PRIVATE_KEY'), this.provider);
  }

  async onApplicationShutdown() {
    clearInterval(this.intervalId);
  }

  getWallet() {
    return this.wallet;
  }

  getProvider() {
    return this.provider;
  }
}
