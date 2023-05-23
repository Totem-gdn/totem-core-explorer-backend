import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  AvatarLegacy,
  AvatarLegacyDocument,
  GemLegacy,
  GemLegacyDocument,
  ItemLegacy,
  ItemLegacyDocument,
} from './schemas';
import {
  AssetLegacyRecord,
  CreateAssetLegacy,
  FindAllQuery,
  FindAllResult,
  FindByRecordId,
} from './asset-legacy.interface';
import { AssetType } from '../../utils/enums';

@Injectable()
export class AssetLegacyService {
  constructor(
    @InjectModel(AvatarLegacy.name) private avatarLegacyModel: Model<AvatarLegacyDocument>,
    @InjectModel(ItemLegacy.name) private assetLegacyModel: Model<ItemLegacyDocument>,
    @InjectModel(GemLegacy.name) private gemLegacyModel: Model<GemLegacyDocument>,
  ) {}

  async create(request: CreateAssetLegacy) {
    const { assetType, recordId, ...record } = request;
    const model = this.getModel(assetType);
    await model.create({ _id: recordId, ...record });
  }

  async findAll(request: FindAllQuery): Promise<FindAllResult> {
    const { assetType, offset, limit } = request;
    const filters = Object.entries(request.filters).reduce((acc, [key, val]) => {
      if (val !== '' && val !== null && val !== undefined) {
        acc[key] = val;
      }
      return acc;
    }, {});
    const model = this.getModel(assetType);
    const total = await model.countDocuments({ ...filters }).exec();
    const results = await model
      .find({ ...filters })
      .skip(offset)
      .limit(limit)
      .sort({ timestamp: -1 })
      .exec();
    return {
      total,
      limit,
      offset,
      results: results.length > 0 ? results.map((doc) => doc.toObject()) : [],
    };
  }

  async findById({ assetType, recordId }: FindByRecordId): Promise<AssetLegacyRecord> {
    const model = this.getModel(assetType);
    const record = await model.findById(recordId).exec();
    if (!record) {
      throw new NotFoundException();
    }
    return record.toObject();
  }

  async countAssetsForGames(gameAddress: string) {
    const avatars = await this.avatarLegacyModel.aggregate([
      { $match: { gameAddress } },
      {
        $group: {
          _id: {
            asset: '$assetId',
          },
          count: { $sum: 1 },
        },
      },
    ]);
    const items = await this.assetLegacyModel.aggregate([
      { $match: { gameAddress } },
      {
        $group: {
          _id: {
            asset: '$assetId',
          },
          count: { $sum: 1 },
        },
      },
    ]);

    return avatars.length
      ? {
          items: items.length,
          avatars: avatars.length,
          gameAddress,
        }
      : {
          items: 0,
          avatars: 0,
          gameAddress,
        };
  }

  private getModel(assetType: AssetType): Model<AvatarLegacyDocument | ItemLegacyDocument | GemLegacyDocument> {
    switch (assetType) {
      case AssetType.AVATAR:
        return this.avatarLegacyModel;
      case AssetType.ITEM:
        return this.assetLegacyModel;
      case AssetType.GEM:
        return this.gemLegacyModel;
      default:
        throw new Error(`invalid asset type ${assetType}`);
    }
  }
}
