import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { LegacyRecord, transform } from './common/legacy-record';

@Schema({
  autoCreate: true,
  collection: 'gemLegacy',
  _id: false,
  timestamps: false,
  toJSON: { transform },
  toObject: { transform },
})
export class GemLegacy extends LegacyRecord {}

export type GemLegacyDocument = HydratedDocument<GemLegacy>;

export const GemLegacySchema = SchemaFactory.createForClass(GemLegacy);
