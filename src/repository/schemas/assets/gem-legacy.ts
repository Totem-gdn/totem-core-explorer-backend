import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { LegacyRecord } from '../common/legacy-record';

@Schema({
  autoCreate: true,
  collection: 'gemLegacy',
  _id: false,
  timestamps: false,
})
export class GemLegacy extends LegacyRecord {}

export type GemLegacyDocument = GemLegacy & Document;

export const GemLegacySchema = SchemaFactory.createForClass(GemLegacy);
