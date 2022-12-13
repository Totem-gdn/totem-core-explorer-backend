import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BigNumber, Contract, Event } from 'ethers';

import * as TotemGameLegacyABI from '../abi/TotemGameLegacy.json';
import { CreateGameLegacy, GameLegacyRecord } from './contract.interface';
import { ProviderService } from '../provider/provider.service';
import { GameLegacyService } from '../../repository/game-legacy';

@Injectable()
export class TotemGameLegacy implements OnApplicationBootstrap {
  private logger = new Logger(TotemGameLegacy.name);
  private contract: Contract;
  private symbol: string;

  constructor(
    private config: ConfigService,
    private providerService: ProviderService,
    private repository: GameLegacyService,
  ) {}

  async onApplicationBootstrap() {
    await this.initContract('GAME_LEGACY_CONTRACT');
  }

  private async initContract(env: string) {
    const address = this.config.get<string>(env);
    if (!address) {
      this.logger.warn(`skipped ${env} contract initialization`);
      return;
    }
    this.contract = new Contract(address, TotemGameLegacyABI, this.providerService.getWallet());
    this.symbol = await this.contract.symbol();
    // await this.fetchPreviousEvents();

    this.contract.on(
      this.contract.filters.GameLegacyRecord(),
      (gameId: BigNumber, recordId: BigNumber, event: Event) => {
        this.logger.log(
          `[${this.symbol}][GameLegacyRecord] recordId: ${recordId.toString()} txHash: ${event.transactionHash}`,
        );
        this.createRecord(gameId, recordId, event);
      },
    );
  }

  private async createRecord(gameId: BigNumber, recordId: BigNumber, event: Event) {
    try {
      const record: GameLegacyRecord = await this.contract.recordByIndex(recordId);
      await this.repository.create({
        recordId: recordId.toString(),
        gameId: gameId.toString(),
        timestamp: record.timestamp.toNumber(),
        data: record.data,
      });
    } catch (ex) {
      if (ex instanceof Error) {
        this.logger.error(
          `[${this.symbol}] recordId: ${recordId.toString()} txHash: ${event.transactionHash} Error: ${ex.message}`,
          ex.stack,
        );
      } else {
        this.logger.error(
          `[${this.symbol}] recordId: ${recordId.toString()} txHash: ${event.transactionHash} Error: ${JSON.stringify(
            ex,
          )}`,
        );
      }
    }
  }

  async create(record: CreateGameLegacy): Promise<string> {
    const { maxFeePerGas, maxPriorityFeePerGas } = this.providerService.getGasPrices();
    const gasLimit = await this.contract.estimateGas.create(BigNumber.from(record.gameId), record.data);
    const tx = await this.contract.create(BigNumber.from(record.gameId), record.data, {
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
    });
    await tx.wait();
    return tx.hash;
  }
}
