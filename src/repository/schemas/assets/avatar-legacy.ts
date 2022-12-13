import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

import { LegacyRecord } from '../common/legacy-record';

@Schema({
  autoCreate: true,
  collection: 'avatarLegacy',
  _id: false,
  timestamps: false,
})
export class AvatarLegacy extends LegacyRecord {
  @Prop({ type: SchemaTypes.String })
  _id: string;
}

export type AvatarLegacyDocument = AvatarLegacy & Document;

export const AvatarLegacySchema = SchemaFactory.createForClass(AvatarLegacy);
