import { Prop } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

export const transform = (doc: LegacyRecord) => ({
  recordId: doc._id,
  playerAddress: doc.playerAddress,
  assetId: doc.assetId,
  gameAddress: doc.gameAddress,
  timestamp: doc.timestamp,
  data: doc.data,
});

export class LegacyRecord {
  @Prop({ type: SchemaTypes.String })
  _id: string;

  @Prop({ type: SchemaTypes.String, required: true, index: true })
  playerAddress: string;

  @Prop({ type: SchemaTypes.String, required: true, index: true })
  assetId: string;

  @Prop({ type: SchemaTypes.String, required: true, index: true })
  gameAddress: string;

  @Prop({ type: SchemaTypes.Number, required: true })
  timestamp: number;

  @Prop({ type: SchemaTypes.String, required: true })
  data: string;
}
