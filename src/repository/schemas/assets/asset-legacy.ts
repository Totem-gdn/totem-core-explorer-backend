import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

import { LegacyRecord } from '../common/legacy-record';

@Schema({
  autoCreate: true,
  collection: 'assetLegacy',
  _id: false,
  timestamps: false,
})
export class AssetLegacy extends LegacyRecord {
  @Prop({ type: SchemaTypes.String })
  _id: string;
}

export type AssetLegacyDocument = AssetLegacy & Document;

export const AssetLegacySchema = SchemaFactory.createForClass(AssetLegacy);
