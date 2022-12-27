import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { BigNumber, Contract, Event } from 'ethers';

import * as TotemGameLegacyABI from '../abi/TotemGameLegacy.json';
import { CreateGameLegacy, GameLegacyRecord } from './contract.interface';
import { ProviderService } from '../provider/provider.service';
import { GameLegacyService } from '../../repository/game-legacy';
import { withRetry } from '../../utils/helpers';

@Injectable()
export class TotemGameLegacy implements OnApplicationBootstrap {
  private logger = new Logger(TotemGameLegacy.name);
  private storageKey = 'contracts::gameLegacy::blockNumber';
  private deployBlockNumber = '29570000';
  private contract: Contract;
  private symbol: string;

  constructor(
    @InjectRedis() private redis: Redis,
    private config: ConfigService,
    private providerService: ProviderService,
    private repository: GameLegacyService,
  ) {}

  async onApplicationBootstrap() {
    this.initContract('GAME_LEGACY_CONTRACT').catch((ex) => {
      if (ex instanceof Error) {
        this.logger.error(ex.message, ex.stack);
      } else {
        this.logger.error(ex);
      }
    });
  }

  private async initContract(contractAddress: string) {
    const address = this.config.get<string>(contractAddress);
    if (!address) {
      this.logger.warn(`skipped ${contractAddress} contract initialization`);
      return;
    }
    this.contract = new Contract(address, TotemGameLegacyABI, this.providerService.getWallet());
    this.symbol = await this.contract.symbol();
    this.logger = new Logger(this.symbol);
    await this.fetchPreviousEvents();
    this.contract.on('GameLegacyRecord', (gameId: BigNumber, recordId: BigNumber, event: Event) => {
      this.logger.log(`event: GameLegacyRecord recordId: ${recordId.toString()} txHash: ${event.transactionHash}`);
      this.createRecord(gameId, recordId, event);
      this.redis.set(this.storageKey, event.blockNumber).catch(() => {
        this.logger.error(`failed to store current event block number`);
      });
    });
  }

  private async fetchPreviousEvents() {
    let block = await this.redis
      .get(this.storageKey)
      .then((blockNumber: string | null) => parseInt(blockNumber || this.deployBlockNumber, 10));
    let currentBlock = await this.providerService.getBlockNumber();
    const blocksPerPage = 2000;
    while (currentBlock > block) {
      this.logger.log(`fetching block from ${block} to ${block + blocksPerPage}`);
      let maxBlockNumber = block;
      const events = await this.contract.queryFilter('GameLegacyRecord', block, block + blocksPerPage);
      for (const event of events) {
        const [gameId, recordId] = event.args;
        await this.createRecord(gameId, recordId, event);
        maxBlockNumber = event.blockNumber;
      }
      await this.redis.set(this.storageKey, maxBlockNumber);
      block += blocksPerPage + 1;
      currentBlock = await this.providerService.getBlockNumber();
    }
    this.logger.log(`fetching of previous events complete`);
    this.logger.log(`current block ${currentBlock}`);
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
          `recordId: ${recordId.toString()} txHash: ${event.transactionHash} Error: ${ex.message}`,
          ex.stack,
        );
      } else {
        this.logger.error(
          `recordId: ${recordId.toString()} txHash: ${event.transactionHash} Error: ${JSON.stringify(ex)}`,
        );
      }
    }
  }

  async create(record: CreateGameLegacy): Promise<string> {
    const gasLimit = await this.contract.estimateGas.create(BigNumber.from(record.gameId), record.data);
    return await withRetry(`GameID: ${record.gameId}`, async () => {
      const { maxFeePerGas, maxPriorityFeePerGas } = await this.providerService.getFeeData();
      const tx = await this.contract.create(BigNumber.from(record.gameId), record.data, {
        gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas,
      });
      await tx.wait();
      return tx.hash;
    });
  }
}
