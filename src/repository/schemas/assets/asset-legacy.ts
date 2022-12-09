import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { LegacyRecord } from '../common/legacy-record';

@Schema({
  autoCreate: true,
  collection: 'assetLegacy',
  _id: false,
  timestamps: false,
})
export class AssetLegacy extends LegacyRecord {}

export type AssetLegacyDocument = AssetLegacy & Document;

export const AssetLegacySchema = SchemaFactory.createForClass(AssetLegacy);
