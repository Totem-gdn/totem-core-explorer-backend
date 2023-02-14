import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Asset, AssetDocument } from './schemas';
import { AssetType } from '../../utils/enums';
import { AssetData, AssetRecord } from './assets.interface';

@Injectable()
export class AssetsService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Asset.name) private readonly assetModel: Model<AssetDocument>,
  ) {}

  async create(assetType: AssetType, assetData: AssetData) {
    await this.assetModel.create({
      _id: assetType,
      ...assetData,
    });
  }

  async update(assetType: AssetType, assetData: Partial<AssetData>) {
    await this.assetModel.findByIdAndUpdate(assetType, { $set: { ...assetData } });
  }

  async find(assetType: AssetType): Promise<AssetRecord> {
    const asset = await this.assetModel.findById(assetType);
    return asset.toObject();
  }
}
