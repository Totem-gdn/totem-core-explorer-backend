import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GameLegacy, GameLegacyDocument } from '../schemas';
import {
  CreateGameLegacy,
  FindAllQuery,
  FindAllResult,
  FindByRecordId,
  GameLegacyRecord,
} from './game-legacy.interface';

@Injectable()
export class GameLegacyService {
  constructor(@InjectModel(GameLegacy.name) private model: Model<GameLegacyDocument>) {}

  private docToRecord(doc: GameLegacyDocument): GameLegacyRecord {
    return {
      recordId: doc._id,
      gameAddress: doc.gameAddress,
      timestamp: doc.timestamp,
      data: doc.data,
    };
  }

  async create(request: CreateGameLegacy) {
    const { recordId, ...record } = request;
    await this.model.create({ _id: recordId, ...record });
  }

  async findAll(request: FindAllQuery): Promise<FindAllResult> {
    const { offset, limit } = request;
    const filters = Object.entries(request.filters).reduce((acc, [key, val]) => {
      if (val !== '' && val !== null && val !== undefined) {
        acc[key] = val;
      }
      return acc;
    }, {});
    const total = await this.model.countDocuments({ ...filters }).exec();
    const results = await this.model
      .find({ ...filters })
      .skip(offset)
      .limit(limit)
      .sort({ timestamp: -1 })
      .exec();
    return {
      total,
      limit,
      offset,
      results: results?.length > 0 ? results.map(this.docToRecord) : [],
    };
  }

  async findById({ recordId }: FindByRecordId): Promise<GameLegacyRecord> {
    const record = await this.model.findById(recordId).exec();
    if (!record) {
      throw new NotFoundException();
    }
    return this.docToRecord(record);
  }
}
