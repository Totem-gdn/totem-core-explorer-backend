import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

const transform = (doc: GameLegacyDocument) => ({
  recordId: doc._id,
  gameAddress: doc.gameAddress,
  timestamp: doc.timestamp,
  data: doc.data,
});

@Schema({
  autoCreate: true,
  collection: 'gameLegacy',
  _id: false,
  timestamps: false,
  toJSON: { transform },
  toObject: { transform },
})
export class GameLegacy {
  @Prop({ type: SchemaTypes.String })
  _id: string;

  @Prop({ type: SchemaTypes.String, required: true, index: true })
  gameAddress: string;

  @Prop({ type: SchemaTypes.Number, required: true })
  timestamp: number;

  @Prop({ type: SchemaTypes.String, required: true })
  data: string;
}

export type GameLegacyDocument = HydratedDocument<GameLegacy>;

export const GameLegacySchema = SchemaFactory.createForClass(GameLegacy);
