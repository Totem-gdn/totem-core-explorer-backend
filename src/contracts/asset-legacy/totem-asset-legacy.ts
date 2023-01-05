import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { BigNumber, Contract, Event } from 'ethers';

import * as TotemAssetLegacyABI from '../abi/TotemAssetLegacy.json';
import { AssetLegacyRecord, CreateAssetLegacy } from './contract.interface';
import { AssetType } from '../../utils/enums';
import { ProviderService } from '../provider/provider.service';
import { AssetLegacyService } from '../../repository/asset-legacy';
import { withRetry } from '../../utils/helpers';

@Injectable()
export class TotemAssetLegacy implements OnApplicationBootstrap {
  private logger = new Logger(TotemAssetLegacy.name);
  private contractLogger: Record<AssetType, Logger> = {
    [AssetType.AVATAR]: this.logger,
    [AssetType.ITEM]: this.logger,
    [AssetType.GEM]: this.logger,
  };
  private storageKeys: Record<AssetType, string> = {
    [AssetType.AVATAR]: 'contracts::avatarLegacy::blockNumber',
    [AssetType.ITEM]: 'contracts::itemLegacy::blockNumber',
    [AssetType.GEM]: 'contracts::gemLegacy::blockNumber',
  };
  private deployBlockNumber: Record<AssetType, string> = {
    [AssetType.AVATAR]: '30575000',
    [AssetType.ITEM]: '30575000',
    [AssetType.GEM]: '30575000',
  };
  private contracts: Record<AssetType, Contract | null> = {
    [AssetType.AVATAR]: null,
    [AssetType.ITEM]: null,
    [AssetType.GEM]: null,
  };
  private symbols: Record<AssetType, string | null> = {
    [AssetType.AVATAR]: null,
    [AssetType.ITEM]: null,
    [AssetType.GEM]: null,
  };

  constructor(
    @InjectRedis() private redis: Redis,
    private config: ConfigService,
    private providerService: ProviderService,
    private repository: AssetLegacyService,
  ) {}

  async onApplicationBootstrap() {
    this.initContract(AssetType.AVATAR, 'AVATAR_LEGACY_CONTRACT').catch((ex) => {
      if (ex instanceof Error) {
        this.logger.error(ex.message, ex.stack);
      } else {
        this.logger.error(ex);
      }
    });
    this.initContract(AssetType.ITEM, 'ITEM_LEGACY_CONTRACT').catch((ex) => {
      if (ex instanceof Error) {
        this.logger.error(ex.message, ex.stack);
      } else {
        this.logger.error(ex);
      }
    });
    this.initContract(AssetType.GEM, 'GEM_LEGACY_CONTRACT').catch((ex) => {
      if (ex instanceof Error) {
        this.logger.error(ex.message, ex.stack);
      } else {
        this.logger.error(ex);
      }
    });
  }

  private async initContract(assetType: AssetType, contractAddress: string) {
    const address = this.config.get<string>(contractAddress);
    if (!address) {
      this.logger.warn(`skipped ${contractAddress} contract initialization`);
      return;
    }
    this.contracts[assetType] = new Contract(address, TotemAssetLegacyABI, this.providerService.getWallet());
    this.symbols[assetType] = await this.contracts[assetType].symbol();
    this.contractLogger[assetType] = new Logger(this.symbols[assetType]);
    await this.fetchPreviousEvents(assetType);
    this.contracts[assetType].on(
      'AssetLegacyRecord',
      (playerAddress: string, gameAddress: string, assetId: BigNumber, recordId: BigNumber, event: Event) => {
        this.contractLogger[assetType].log(`event: AssetLegacyRecord txHash: ${event.transactionHash}`);
        this.createRecord(assetType, playerAddress, gameAddress, assetId, recordId, event);
        this.redis.set(this.storageKeys[assetType], event.blockNumber).catch(() => {
          this.contractLogger[assetType].error(`failed to store current event block number`);
        });
      },
    );
  }

  private async fetchPreviousEvents(assetType: AssetType) {
    let block = await this.redis
      .get(this.storageKeys[assetType])
      .then((blockNumber: string | null) => parseInt(blockNumber || this.deployBlockNumber[assetType], 10));
    let currentBlock = await this.providerService.getBlockNumber();
    const blocksPerPage = 2000;
    while (currentBlock > block) {
      this.contractLogger[assetType].log(`fetching block from ${block} to ${block + blocksPerPage}`);
      let maxBlockNumber = block;
      const events = await this.contracts[assetType].queryFilter('AssetLegacyRecord', block, block + blocksPerPage);
      for (const event of events) {
        const [playerAddress, gameAddress, assetId, recordId] = event.args;
        await this.createRecord(assetType, playerAddress, gameAddress, assetId, recordId, event);
        maxBlockNumber = event.blockNumber;
      }
      await this.redis.set(this.storageKeys[assetType], maxBlockNumber);
      block += blocksPerPage + 1;
      currentBlock = await this.providerService.getBlockNumber();
    }
    this.contractLogger[assetType].log(`fetching of previous events complete`);
    this.contractLogger[assetType].log(`current block ${currentBlock}`);
  }

  private async createRecord(
    assetType: AssetType,
    playerAddress: string,
    gameAddress: string,
    assetId: BigNumber,
    recordId: BigNumber,
    event: Event,
  ) {
    try {
      const record: AssetLegacyRecord = await this.contracts[assetType].recordByIndex(recordId);
      await this.repository.create({
        assetType,
        recordId: recordId.toString(),
        playerAddress,
        assetId: assetId.toString(),
        gameAddress,
        timestamp: record.timestamp.toNumber(),
        data: record.data,
      });
    } catch (ex) {
      if (ex instanceof Error) {
        this.contractLogger[assetType].error(
          `recordId: ${recordId.toString()} txHash: ${event.transactionHash} Error: ${ex.message}`,
          ex.stack,
        );
      } else {
        this.contractLogger[assetType].error(
          `recordId: ${recordId.toString()} txHash: ${event.transactionHash} Error: ${JSON.stringify(ex)}`,
        );
      }
    }
  }

  async create(assetType: AssetType, record: CreateAssetLegacy): Promise<string> {
    const gasLimit = await this.contracts[assetType].estimateGas.create(
      record.playerAddress,
      record.gameAddress,
      BigNumber.from(record.assetId),
      record.data,
    );
    return await withRetry(
      `AssetType: ${assetType} AssetID: ${record.assetId} Game: ${record.gameAddress}`,
      async () => {
        const { maxFeePerGas, maxPriorityFeePerGas } = await this.providerService.getFeeData();
        const tx = await this.contracts[assetType].create(
          record.playerAddress,
          record.gameAddress,
          BigNumber.from(record.assetId),
          record.data,
          { gasLimit, maxFeePerGas, maxPriorityFeePerGas },
        );
        await tx.wait();
        return tx.hash;
      },
      {
        maxRetries: 60,
      },
    );
  }
}
