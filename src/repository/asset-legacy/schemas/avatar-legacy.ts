import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { LegacyRecord, transform } from './common/legacy-record';

@Schema({
  autoCreate: true,
  collection: 'avatarLegacy',
  _id: false,
  timestamps: false,
  toJSON: { transform },
  toObject: { transform },
})
export class AvatarLegacy extends LegacyRecord {}

export type AvatarLegacyDocument = HydratedDocument<AvatarLegacy>;

export const AvatarLegacySchema = SchemaFactory.createForClass(AvatarLegacy);
