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
  _id: string;

  @Prop({ type: SchemaTypes.String, required: true, index: true, unique: true })
  recordId: string;

  @Prop({ type: SchemaTypes.String, required: true, index: true })
  owner: string;

  @Prop({ type: SchemaTypes.String, required: true, index: true })
  name: string;

  @Prop({ type: SchemaTypes.String, required: true, index: true })
  author: string;

  @Prop({ type: SchemaTypes.String, required: true })
  renderer: string;

  @Prop({ type: SchemaTypes.String, required: true })
  avatarFilter: string;

  @Prop({ type: SchemaTypes.String, required: true })
  assetFilter: string;

  @Prop({ type: SchemaTypes.String, required: true })
  gemFilter: string;

  @Prop({ type: SchemaTypes.String, required: true })
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
