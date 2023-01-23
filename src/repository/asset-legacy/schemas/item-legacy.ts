import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { LegacyRecord, transform } from './common/legacy-record';

@Schema({
  autoCreate: true,
  collection: 'itemLegacy',
  _id: false,
  timestamps: false,
  toJSON: { transform },
  toObject: { transform },
})
export class ItemLegacy extends LegacyRecord {}

export type ItemLegacyDocument = HydratedDocument<ItemLegacy>;

export const ItemLegacySchema = SchemaFactory.createForClass(ItemLegacy);
