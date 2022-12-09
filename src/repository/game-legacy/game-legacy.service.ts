import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GameLegacy, GameLegacyDocument } from '../schemas';
import {
  GameLegacyRecord,
  CreateGameLegacy,
  FindAllQuery,
  FindAllResult,
  FindByRecordId,
} from './game-legacy.interface';

@Injectable()
export class GameLegacyService {
  private logger = new Logger(GameLegacyService.name);

  constructor(@InjectModel(GameLegacy.name) private model: Model<GameLegacyDocument>) {}

  private docToRecord(doc: GameLegacyDocument): GameLegacyRecord {
    return {
      recordId: doc.recordId,
      gameId: doc.gameId,
      timestamp: doc.timestamp,
      data: doc.data,
    };
  }

  async create(request: CreateGameLegacy) {
    await this.model.create({ ...request });
  }

  async findAll(request: FindAllQuery): Promise<FindAllResult> {
    const { filters, offset, limit } = request;
    const total = await this.model.countDocuments({ ...filters }).exec();
    const results = await this.model
      .find({ ...filters })
      .skip(offset)
      .limit(limit)
      .sort({ recordId: -1 })
      .exec();
    return {
      total,
      limit,
      offset,
      results: results.map(this.docToRecord),
    };
  }

  async findById({ recordId }: FindByRecordId): Promise<GameLegacyRecord> {
    const record = await this.model.findOne({ recordId }).exec();
    return this.docToRecord(record);
  }
}
