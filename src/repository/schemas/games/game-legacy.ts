import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema({
  autoCreate: true,
  collection: 'gameLegacy',
  _id: false,
  timestamps: false,
})
export class GameLegacy {
  @Prop({ type: SchemaTypes.String })
  _id: string;

  @Prop({ type: SchemaTypes.String, required: true, index: true })
  gameId: string;

  @Prop({ type: SchemaTypes.Number, required: true })
  timestamp: number;

  @Prop({ type: SchemaTypes.String, required: true })
  data: string;
}

export type GameLegacyDocument = GameLegacy & Document;

export const GameLegacySchema = SchemaFactory.createForClass(GameLegacy);
