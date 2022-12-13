import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BigNumber, Contract, Event } from 'ethers';

import * as TotemGamesDirectoryABI from '../abi/TotemGamesDirectory.json';
import { CreateGameRecord, GameRecord } from './contract.interface';
import { ProviderService } from '../provider/provider.service';
import { GamesDirectoryService } from '../../repository/games-directory';

@Injectable()
export class TotemGamesDirectory implements OnApplicationBootstrap {
  private logger = new Logger(TotemGamesDirectory.name);

  private contract: Contract;
  private symbol: string;

  constructor(
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
    this.contract.on(this.contract.filters.CreateGame(), (owner: string, recordId: BigNumber, event: Event) => {
      this.logger.log(`[${this.symbol}][CreateGame] recordId: ${recordId} txHash: ${event.transactionHash}`);
      this.createGame(owner, recordId, event);
    });
    this.contract.on(this.contract.filters.UpdateGame(), (recordId: string, updatedField: string, event: Event) => {
      this.logger.log(`[${this.symbol}][UpdateGame] recordId: ${recordId} txHash: ${event.transactionHash}`);
    });
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
        assetFilter: game.assetFilter,
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
    const { maxFeePerGas, maxPriorityFeePerGas } = this.providerService.getGasPrices();
    const gasLimit = await this.contract.estimateGas.create(record.owner, record.game, record.status);
    const tx = await this.contract.create(record.owner, record.game, record.status, {
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
    });
    await tx.wait();
    return tx.hash;
  }
}
