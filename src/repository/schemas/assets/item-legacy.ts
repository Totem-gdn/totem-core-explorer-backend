import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

import { LegacyRecord } from '../common/legacy-record';

@Schema({
  autoCreate: true,
  collection: 'itemLegacy',
  _id: false,
  timestamps: false,
})
export class ItemLegacy extends LegacyRecord {
  @Prop({ type: SchemaTypes.String })
  _id: string;
}

export type ItemLegacyDocument = ItemLegacy & Document;

export const ItemLegacySchema = SchemaFactory.createForClass(ItemLegacy);
