import { Prop } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

export class LegacyRecord {
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
