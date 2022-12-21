import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { GameStatus } from '../../../utils/enums';

@Schema({
  autoCreate: true,
  collection: 'gamesDirectory',
  _id: false,
  timestamps: false,
})
export class GamesDirectory {
  @Prop({ type: SchemaTypes.String })
  _id: string;

  @Prop({ type: SchemaTypes.String, required: true, index: true })
  owner: string;

  @Prop({ type: SchemaTypes.String, required: true, index: true })
  name: string;

  @Prop({ type: SchemaTypes.String, required: true, index: true })
  author: string;

  @Prop({ type: SchemaTypes.String })
  renderer: string;

  @Prop({ type: SchemaTypes.String })
  avatarFilter: string;

  @Prop({ type: SchemaTypes.String })
  itemFilter: string;

  @Prop({ type: SchemaTypes.String })
  gemFilter: string;

  @Prop({ type: SchemaTypes.String })
  website: string;

  @Prop({ type: SchemaTypes.Number, required: true })
  createdAt: number;

  @Prop({ type: SchemaTypes.Number, required: true })
  updatedAt: number;

  @Prop({ type: SchemaTypes.Number, required: true })
  status: GameStatus;
}

export type GameDocument = GamesDirectory & Document;

export const GamesDirectorySchema = SchemaFactory.createForClass(GamesDirectory);
