import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  ItemLegacy,
  ItemLegacyDocument,
  AvatarLegacy,
  AvatarLegacyDocument,
  GemLegacy,
  GemLegacyDocument,
} from '../schemas';
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

  private docToRecord(doc: AvatarLegacyDocument | ItemLegacyDocument | GemLegacyDocument): AssetLegacyRecord {
    return {
      recordId: doc._id,
      playerAddress: doc.playerAddress,
      assetId: doc.assetId,
      gameId: doc.gameId,
      timestamp: doc.timestamp,
      data: doc.data,
    };
  }

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
      results: results.length > 0 ? results.map(this.docToRecord) : [],
    };
  }

  async findById({ assetType, recordId }: FindByRecordId): Promise<AssetLegacyRecord> {
    const model = this.getModel(assetType);
    const record = await model.findById(recordId).exec();
    if (!record) {
      throw new NotFoundException();
    }
    return this.docToRecord(record);
  }
}
