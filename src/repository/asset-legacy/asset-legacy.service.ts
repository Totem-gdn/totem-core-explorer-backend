import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  AssetLegacy,
  AssetLegacyDocument,
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
  private logger = new Logger(AssetLegacyService.name);

  constructor(
    @InjectModel(AvatarLegacy.name) private avatarLegacyModel: Model<AvatarLegacyDocument>,
    @InjectModel(AssetLegacy.name) private assetLegacyModel: Model<AssetLegacyDocument>,
    @InjectModel(GemLegacy.name) private gemLegacyModel: Model<GemLegacyDocument>,
  ) {}

  private getModel(assetType: AssetType) {
    switch (assetType) {
      case AssetType.AVATAR:
        return this.avatarLegacyModel;
      case AssetType.ASSET:
        return this.assetLegacyModel;
      case AssetType.GEM:
        return this.gemLegacyModel;
      default:
        throw new Error(`invalid asset type ${assetType}`);
    }
  }

  private docToRecord(doc: AvatarLegacyDocument | AssetLegacyDocument | GemLegacyDocument): AssetLegacyRecord {
    return {
      recordId: doc.recordId,
      playerAddress: doc.playerAddress,
      assetId: doc.assetId,
      gameId: doc.gameId,
      timestamp: doc.timestamp,
      data: doc.data,
    };
  }

  async create(request: CreateAssetLegacy) {
    const { assetType, ...record } = request;
    const model = this.getModel(assetType);
    await model.create(record);
  }

  async findAll(request: FindAllQuery): Promise<FindAllResult> {
    const { assetType, filters, offset, limit } = request;
    const model = this.getModel(assetType);
    const total = await model.countDocuments({ ...filters }).exec();
    const results = await model
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

  async findById({ assetType, recordId }: FindByRecordId): Promise<AssetLegacyRecord> {
    const model = this.getModel(assetType);
    const record = await model.findOne({ recordId }).exec();
    return this.docToRecord(record);
  }
}
