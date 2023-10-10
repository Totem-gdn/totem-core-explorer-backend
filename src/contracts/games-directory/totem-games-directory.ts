import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Contract, Event } from 'ethers';

import { withRetry } from '../../utils/helpers';
import * as TotemGamesDirectoryABI from '../abi/TotemGamesDirectory.json';
import { CreateGameRecord, GameRecord, UpdateGameRecord } from './contract.interface';
import { ProviderService } from '../provider/provider.service';
import { GamesDirectoryService } from '../../repository/games-directory';

@Injectable()
export class TotemGamesDirectory implements OnApplicationBootstrap {
  private logger = new Logger(TotemGamesDirectory.name);
  private storageKey = 'contracts::gamesDirectory::blockNumber';
  private contract: Contract;
  private symbol: string;

  constructor(
    @InjectRedis() private redis: Redis,
    private config: ConfigService,
    private providerService: ProviderService,
    private repository: GamesDirectoryService,
  ) {}

  async onApplicationBootstrap() {
    this.initContract('GAMES_DIRECTORY_CONTRACT').catch((ex) => {
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
    this.contract = new Contract(address, TotemGamesDirectoryABI, this.providerService.getWallet());
    this.symbol = await this.contract.symbol();
    this.logger = new Logger(this.symbol);
    this.logger.log(`contract address: ${address}`);
    this.storageKey = `${this.symbol}::${address}::blockNumber`;
    await this.fetchPreviousEvents();
    this.contract.on('CreateGame', (gameAddress: string, ownerAddress: string, event: Event) => {
      this.createGame(gameAddress, ownerAddress, event);
      this.redis.set(this.storageKey, event.blockNumber);
    });
    this.contract.on('UpdateGame', (gameAddress: string, event: Event) => {
      this.updateGame(gameAddress, event);
      this.redis.set(this.storageKey, event.blockNumber);
    });
  }

  private async fetchPreviousEvents() {
    let block = await this.redis
      .get(this.storageKey)
      .then((blockNumber: string | null) => parseInt(blockNumber || '30575000', 10));
    let currentBlock = await this.providerService.getBlockNumber();
    const blocksPerPage = 1000;
    while (currentBlock > block) {
      this.logger.log(`fetching block from ${block} to ${block + blocksPerPage}`);
      let maxBlockNumber = block;
      let lastBlock = block + blocksPerPage;
      if (Number(lastBlock) > Number(currentBlock)) {
        console.log('USE CURRENT BLOCK AS LATEST');
        lastBlock = currentBlock;
      }
      const createEvents = await this.contract.queryFilter('CreateGame', block, lastBlock);
      for (const event of createEvents) {
        const [gameAddress, ownerAddress] = event.args;
        await this.createGame(gameAddress, ownerAddress, event);
        maxBlockNumber = event.blockNumber > maxBlockNumber ? event.blockNumber : maxBlockNumber;
      }
      const updateEvents = await this.contract.queryFilter('UpdateGame', block, lastBlock);
      for (const event of updateEvents) {
        const [gameAddress] = event.args;
        await this.updateGame(gameAddress, event);
        maxBlockNumber = event.blockNumber > maxBlockNumber ? event.blockNumber : maxBlockNumber;
      }
      await this.redis.set(this.storageKey, maxBlockNumber);
      block = lastBlock + 1;
      currentBlock = await this.providerService.getBlockNumber();
    }
    this.logger.log(`fetching of previous events complete`);
    this.logger.log(`current block ${currentBlock}`);
  }

  private async createGame(gameAddress: string, ownerAddress: string, event: Event) {
    this.logger.log(
      `event: CreateGame gameAddress: ${gameAddress} ownerAddress: ${ownerAddress} txHash: ${event.transactionHash}`,
    );
    try {
      const game: GameRecord = await this.contract.gameByAddress(gameAddress);
      await this.repository.create({
        gameAddress,
        ownerAddress,
        name: game.name,
        author: game.author,
        renderer: game.renderer,
        avatarFilter: game.avatarFilter,
        itemFilter: game.itemFilter,
        gemFilter: game.gemFilter,
        website: game.website,
        createdAt: game.createdAt.toNumber(),
        updatedAt: game.updatedAt.toNumber(),
        status: game.status,
      });
    } catch (ex) {
      if (ex instanceof Error) {
        this.logger.error(
          `event: CreateGame gameAddress: ${gameAddress} txHash: ${event.transactionHash} Error: ${ex.message}`,
          ex.stack,
        );
      } else {
        this.logger.error(
          `event: CreateGame gameAddress: ${gameAddress} txHash: ${event.transactionHash} Error: ${JSON.stringify(ex)}`,
        );
      }
    }
  }

  private async updateGame(gameAddress: string, event: Event) {
    this.logger.log(`event: UpdateGame gameAddress: ${gameAddress} txHash: ${event.transactionHash}`);
    try {
      const game: GameRecord = await this.contract.gameByAddress(gameAddress);
      await this.repository.update({
        gameAddress,
        ownerAddress: game.ownerAddress,
        name: game.name,
        author: game.author,
        renderer: game.renderer,
        avatarFilter: game.avatarFilter,
        itemFilter: game.itemFilter,
        gemFilter: game.gemFilter,
        website: game.website,
        updatedAt: game.updatedAt.toNumber(),
        status: game.status,
      });
    } catch (ex) {
      if (ex instanceof Error) {
        this.logger.error(
          `event: UpdateGame gameAddress: ${gameAddress} txHash: ${event.transactionHash} Error: ${ex.message}`,
          ex.stack,
        );
      } else {
        this.logger.error(
          `event: UpdateGame gameAddress: ${gameAddress} txHash: ${event.transactionHash} Error: ${JSON.stringify(ex)}`,
        );
      }
    }
  }

  async create(record: CreateGameRecord): Promise<string> {
    const { gameAddress, ...game } = record;
    const gasLimit = await this.contract.estimateGas.create(gameAddress, game);
    return await withRetry(
      `CreateGame: ${gameAddress}`,
      async () => {
        const { maxFeePerGas, maxPriorityFeePerGas } = await this.providerService.getFeeData();
        const tx = await this.contract.create(gameAddress, game, {
          gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas,
        });
        await tx.wait();
        return tx.hash;
      },
      {
        maxRetries: 60,
      },
    );
  }

  async update(record: UpdateGameRecord): Promise<string> {
    const { gameAddress, ...game } = record;
    const gasLimit = await this.contract.estimateGas.update(gameAddress, game);
    return await withRetry(
      `UpdateGame: ${gameAddress}`,
      async () => {
        const { maxFeePerGas, maxPriorityFeePerGas } = await this.providerService.getFeeData();
        const tx = await this.contract.update(gameAddress, game, {
          gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas,
        });
        await tx.wait();
        return tx.hash;
      },
      {
        maxRetries: 60,
      },
    );
  }
}
