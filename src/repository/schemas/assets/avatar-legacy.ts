import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { LegacyRecord } from '../common/legacy-record';

@Schema({
  autoCreate: true,
  collection: 'avatarLegacy',
  _id: false,
  timestamps: false,
})
export class AvatarLegacy extends LegacyRecord {}

export type AvatarLegacyDocument = AvatarLegacy & Document;

export const AvatarLegacySchema = SchemaFactory.createForClass(AvatarLegacy);
