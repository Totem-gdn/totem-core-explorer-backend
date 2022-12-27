import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { BigNumber, Contract, Event } from 'ethers';

import { withRetry } from '../../utils/helpers';
import * as TotemGamesDirectoryABI from '../abi/TotemGamesDirectory.json';
import { CreateGameRecord, GameRecord, UpdateGameRecord } from './contract.interface';
import { ProviderService } from '../provider/provider.service';
import { GamesDirectoryService } from '../../repository/games-directory';

@Injectable()
export class TotemGamesDirectory implements OnApplicationBootstrap {
  private logger = new Logger(TotemGamesDirectory.name);
  private storageKey = 'contracts::gamesDirectory::blockNumber';
  private deployBlockNumber = '29500000';
  private contract: Contract;
  private symbol: string;
  private updateContractFunction = {
    owner: 'changeOwner',
    name: 'changeName',
    author: 'changeAuthor',
    renderer: 'changeRenderer',
    avatarFilter: 'changeAvatarFilter',
    itemFilter: 'changeItemFilter',
    gemFilter: 'changeGemFilter',
    website: 'changeWebsite',
    status: 'changeStatus',
  };

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
    await this.fetchPreviousEvents();
    this.contract.on('CreateGame', (owner: string, recordId: BigNumber, event: Event) => {
      this.logger.log(
        `[${this.symbol}][CreateGame] recordId: ${recordId} owner: ${owner} txHash: ${event.transactionHash}`,
      );
      this.createGame(owner, recordId, event);
      this.redis.set(this.storageKey, event.blockNumber);
    });
    this.contract.on('UpdateGame', (recordId: BigNumber, updatedField: string, event: Event) => {
      this.logger.log(
        `event: UpdateGame recordId: ${recordId} field: ${updatedField} txHash: ${event.transactionHash}`,
      );
      this.updateGame(recordId, updatedField, event);
      this.redis.set(this.storageKey, event.blockNumber);
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
      const createEvents = await this.contract.queryFilter('CreateGame', block, block + blocksPerPage);
      for (const event of createEvents) {
        const [owner, recordId] = event.args;
        await this.createGame(owner, recordId, event);
        maxBlockNumber = event.blockNumber > maxBlockNumber ? event.blockNumber : maxBlockNumber;
      }
      const updateEvents = await this.contract.queryFilter('UpdateGame', block, block + blocksPerPage);
      for (const event of updateEvents) {
        const [recordId, updatedField] = event.args;
        await this.updateGame(recordId, updatedField, event);
        maxBlockNumber = event.blockNumber > maxBlockNumber ? event.blockNumber : maxBlockNumber;
      }
      await this.redis.set(this.storageKey, maxBlockNumber);
      block += blocksPerPage + 1;
      currentBlock = await this.providerService.getBlockNumber();
    }
    this.logger.log(`fetching of previous events complete`);
    this.logger.log(`current block ${currentBlock}`);
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
          `event: CreateGame recordId: ${recordId.toString()} txHash: ${event.transactionHash} Error: ${ex.message}`,
          ex.stack,
        );
      } else {
        this.logger.error(
          `event: CreateGame recordId: ${recordId.toString()} txHash: ${event.transactionHash} Error: ${JSON.stringify(
            ex,
          )}`,
        );
      }
    }
  }

  private async updateGame(recordId: BigNumber, updatedField: string, event: Event) {
    try {
      const { game, status }: GameRecord = await this.contract.recordByIndex(recordId);
      await this.repository.update({
        recordId: recordId.toString(),
        updatedField: updatedField,
        data: updatedField === 'status' ? status : game[updatedField],
        updatedAt: game.updatedAt.toNumber(),
      });
    } catch (ex) {
      if (ex instanceof Error) {
        this.logger.error(
          `event: UpdateGame recordId: ${recordId.toString()} txHash: ${event.transactionHash} Error: ${ex.message}`,
          ex.stack,
        );
      } else {
        this.logger.error(
          `event: UpdateGame recordId: ${recordId.toString()} txHash: ${event.transactionHash} Error: ${JSON.stringify(
            ex,
          )}`,
        );
      }
    }
  }

  async create(record: CreateGameRecord): Promise<string> {
    const gasLimit = await this.contract.estimateGas.create(record.owner, record.game, record.status);
    return await withRetry(`GameName: ${record.game.name}`, async () => {
      const { maxFeePerGas, maxPriorityFeePerGas } = await this.providerService.getFeeData();
      const tx = await this.contract.create(record.owner, record.game, record.status, {
        gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas,
      });
      await tx.wait();
      return tx.hash;
    });
  }

  async update(record: UpdateGameRecord): Promise<string> {
    const gasLimit = await this.contract.estimateGas[this.updateContractFunction[record.field]](
      BigNumber.from(record.recordId),
      record.data,
    );
    return await withRetry(`GameId: ${record.recordId} Field: ${record.field}`, async () => {
      const { maxFeePerGas, maxPriorityFeePerGas } = await this.providerService.getFeeData();
      const tx = await this.contract[this.updateContractFunction[record.field]](
        BigNumber.from(record.recordId),
        record.data,
        {
          gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas,
        },
      );
      await tx.wait();
      return tx.hash;
    });
  }
}
