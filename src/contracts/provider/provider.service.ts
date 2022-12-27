import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { providers, Wallet } from 'ethers';

@Injectable()
export class ProviderService implements OnApplicationBootstrap {
  private wallet: Wallet;
  private provider: providers.JsonRpcProvider;

  constructor(private config: ConfigService) {}

  async onApplicationBootstrap() {
    this.provider = new providers.JsonRpcProvider(this.config.get<string>('PROVIDER_URL'));
    this.wallet = new Wallet(this.config.get<string>('PROVIDER_PRIVATE_KEY'), this.provider);
  }

  getWallet() {
    return this.wallet;
  }

  async getBlockNumber() {
    return this.provider.getBlockNumber();
  }

  async getFeeData() {
    return this.provider.getFeeData();
  }
}
