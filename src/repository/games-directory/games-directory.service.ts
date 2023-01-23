import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GameDocument, GamesDirectory } from './schemas';
import {
  CreateGameRecord,
  FindAllQuery,
  FindAllResult,
  FindByAddress,
  GameRecord,
  UpdateGameRecord,
} from './games-directory.interface';

@Injectable()
export class GamesDirectoryService {
  constructor(@InjectModel(GamesDirectory.name) private model: Model<GameDocument>) {}

  async create(request: CreateGameRecord) {
    const { gameAddress, ...record } = request;
    await this.model.create({ _id: gameAddress, ...record });
  }

  async update(request: UpdateGameRecord) {
    const { gameAddress, ...record } = request;
    await this.model.updateOne(
      { _id: gameAddress },
      {
        ownerAddress: record.ownerAddress,
        name: record.name,
        author: record.author,
        renderer: record.renderer,
        avatarFilter: record.avatarFilter,
        itemFilter: record.itemFilter,
        gemFilter: record.gemFilter,
        website: record.website,
        updatedAt: record.updatedAt,
        status: record.status,
      },
    );
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
      .sort({ createdAt: -1 })
      .exec();
    return {
      total,
      limit,
      offset,
      results: results.length > 0 ? results.map((doc) => doc.toObject()) : [],
    };
  }

  async findByAddress({ gameAddress }: FindByAddress): Promise<GameRecord> {
    const record = await this.model.findById(gameAddress).exec();
    if (!record) {
      throw new NotFoundException();
    }
    return record.toObject();
  }

  async isExists(gameAddress: string): Promise<boolean> {
    const record = await this.model.findById(gameAddress).exec();
    return !!record;
  }
}
