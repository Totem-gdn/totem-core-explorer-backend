import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { BigNumber, Contract, Event } from 'ethers';

import { withRetry } from '../../utils/helpers';
import * as TotemGamesDirectoryABI from '../abi/TotemGamesDirectory.json';
import { CreateGameRecord, GameRecord } from './contract.interface';
import { ProviderService } from '../provider/provider.service';
import { GamesDirectoryService } from '../../repository/games-directory';

@Injectable()
export class TotemGamesDirectory implements OnApplicationBootstrap {
  private logger = new Logger(TotemGamesDirectory.name);
  private storageKey = 'contracts::gamesDirectory::blockNumber';
  private deployBlockNumber = '29500000';
  private contract: Contract;
  private symbol: string;

  constructor(
    @InjectRedis() private redis: Redis,
    private config: ConfigService,
    private providerService: ProviderService,
    private repository: GamesDirectoryService,
  ) {}

  async onApplicationBootstrap() {
    await this.initContract('GAMES_DIRECTORY_CONTRACT');
  }

  private async initContract(env: string) {
    const address = this.config.get<string>(env);
    if (!address) {
      this.logger.warn(`skipped ${env} contract initialization`);
      return;
    }
    this.contract = new Contract(address, TotemGamesDirectoryABI, this.providerService.getWallet());
    this.symbol = await this.contract.symbol();
    await this.fetchPreviousEvents();
    this.contract.on('CreateGame', (owner: string, recordId: BigNumber, event: Event) => {
      this.logger.log(`[${this.symbol}][CreateGame] recordId: ${recordId} txHash: ${event.transactionHash}`);
      this.createGame(owner, recordId, event);
    });
    this.contract.on('UpdateGame', (recordId: string, updatedField: string, event: Event) => {
      this.logger.log(`[${this.symbol}][UpdateGame] recordId: ${recordId} txHash: ${event.transactionHash}`);
    });
  }

  private async fetchPreviousEvents() {
    let block = await this.redis
      .get(this.storageKey)
      .then((blockNumber: string | null) => parseInt(blockNumber || this.deployBlockNumber, 10));
    let currentBlock = await this.providerService.getProvider().getBlockNumber();
    const blocksPerPage = 2000;
    while (currentBlock > block) {
      this.logger.log(`[${this.symbol}] fetching block from ${block} to ${block + blocksPerPage}`);
      const createEvents = await this.contract.queryFilter('CreateGame', block, block + blocksPerPage);
      for (const event of createEvents) {
        const [owner, recordId] = event.args;
        await this.createGame(owner, recordId, event);
      }
      // const updateEvents = await this.contract.queryFilter('UpdateGame', block, block + blocksPerPage);
      // for (const event of updateEvents) {
      //   const [owner, recordId] = event.args;
      // }
      block += blocksPerPage + 1;
      currentBlock = await this.providerService.getProvider().getBlockNumber();
      await this.redis.set(this.storageKey, block);
    }
    this.logger.log(`[${this.symbol}] fetching of previous events complete`);
    this.logger.log(`[${this.symbol}] current block ${currentBlock}`);
  }

  private async createGame(owner: string, recordId: BigNumber, event: Event) {
    try {
      const { game, status }: GameRecord = await this.contract.recordByIndex(recordId);
      await this.repository.create({
        recordId: recordId.toString(),
        owner,
        name: game.name,
        author: game.author,
        renderer: game.renderer,
        avatarFilter: game.avatarFilter,
        itemFilter: game.itemFilter,
        gemFilter: game.gemFilter,
        website: game.website,
        createdAt: game.createdAt.toNumber(),
        updatedAt: game.updatedAt.toNumber(),
        status,
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

  async create(record: CreateGameRecord): Promise<string> {
    const gasLimit = await this.contract.estimateGas.create(record.owner, record.game, record.status);
    return await withRetry(`[${this.symbol}] GameName: ${record.game.name}`, async () => {
      const { maxFeePerGas, maxPriorityFeePerGas } = await this.providerService.getProvider().getFeeData();
      const tx = await this.contract.create(record.owner, record.game, record.status, {
        gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas,
      });
      await tx.wait();
      return tx.hash;
    });
  }
}
