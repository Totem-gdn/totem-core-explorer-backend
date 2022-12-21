import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    private config: ConfigService,
    private providerService: ProviderService,
    private repository: AssetLegacyService,
  ) {}

  async onApplicationBootstrap() {
    await this.initContract(AssetType.AVATAR, 'AVATAR_LEGACY_CONTRACT');
    await this.initContract(AssetType.ITEM, 'ITEM_LEGACY_CONTRACT');
    await this.initContract(AssetType.GEM, 'GEM_LEGACY_CONTRACT');
  }

  private async initContract(assetType: AssetType, env: string) {
    const address = this.config.get<string>(env);
    if (!address) {
      this.logger.warn(`skipped ${env} contract initialization`);
      return;
    }
    this.contracts[assetType] = new Contract(address, TotemAssetLegacyABI, this.providerService.getWallet());
    this.symbols[assetType] = await this.contracts[assetType].symbol();
    this.contracts[assetType].on(
      this.contracts[assetType].filters.AssetLegacyRecord(),
      (player: string, assetId: BigNumber, gameId: BigNumber, recordId: BigNumber, event: Event) => {
        this.logger.log(
          `[${this.symbols[assetType]}][AssetLegacyRecord] recordId: ${recordId.toString()} txHash: ${
            event.transactionHash
          }`,
        );
        this.createRecord(assetType, player, assetId, gameId, recordId, event);
      },
    );
  }

  private async createRecord(
    assetType: AssetType,
    playerAddress: string,
    assetId: BigNumber,
    gameId: BigNumber,
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
        gameId: gameId.toString(),
        timestamp: record.timestamp.toNumber(),
        data: record.data,
      });
    } catch (ex) {
      if (ex instanceof Error) {
        this.logger.error(
          `[${this.symbols[assetType]}] recordId: ${recordId.toString()} txHash: ${event.transactionHash} Error: ${
            ex.message
          }`,
          ex.stack,
        );
      } else {
        this.logger.error(
          `[${this.symbols[assetType]}] recordId: ${recordId.toString()} txHash: ${
            event.transactionHash
          } Error: ${JSON.stringify(ex)}`,
        );
      }
    }
  }

  async create(assetType: AssetType, record: CreateAssetLegacy): Promise<string> {
    const gasLimit = await this.contracts[assetType].estimateGas.create(
      record.playerAddress,
      BigNumber.from(record.assetId),
      BigNumber.from(record.gameId),
      record.data,
    );
    return await withRetry(
      `[${this.symbols[assetType]}] AssetID: ${record.assetId} GameID: ${record.gameId}`,
      async () => {
        const { maxFeePerGas, maxPriorityFeePerGas } = await this.providerService.getProvider().getFeeData();
        const tx = await this.contracts[assetType].create(
          record.playerAddress,
          BigNumber.from(record.assetId),
          BigNumber.from(record.gameId),
          record.data,
          { gasLimit, maxFeePerGas, maxPriorityFeePerGas },
        );
        await tx.wait();
        return tx.hash;
      },
    );
  }
}
