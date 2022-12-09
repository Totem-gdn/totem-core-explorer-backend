import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GamesDirectory, GameDocument } from '../schemas';
import { CreateGameRecord, GameRecord } from './games-directory.interface';

@Injectable()
export class GamesDirectoryService {
  private logger = new Logger(GamesDirectoryService.name);

  constructor(@InjectModel(GamesDirectory.name) private gameRecordModel: Model<GameDocument>) {}

  private docToRecord(doc: GameDocument): GameRecord {
    return {
      recordId: doc.recordId,
      owner: doc.owner,
      name: doc.name,
      author: doc.author,
      renderer: doc.renderer,
      avatarFilter: doc.avatarFilter,
      assetFilter: doc.assetFilter,
      gemFilter: doc.gemFilter,
      website: doc.website,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      status: doc.status,
    };
  }

  async create(request: CreateGameRecord) {
    await this.gameRecordModel.create({ ...request });
  }
}
