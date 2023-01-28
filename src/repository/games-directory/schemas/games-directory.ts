import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { GameStatus } from '../../../utils/enums';

const transform = (doc: GameDocument) => ({
  gameAddress: doc._id,
  ownerAddress: doc.ownerAddress,
  name: doc.name,
  author: doc.author,
  renderer: doc.renderer,
  avatarFilter: doc.avatarFilter,
  itemFilter: doc.itemFilter,
  gemFilter: doc.gemFilter,
  website: doc.website,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  status: doc.status,
});

@Schema({
  autoCreate: true,
  collection: 'gamesDirectory',
  _id: false,
  timestamps: false,
  toJSON: { transform },
  toObject: { transform },
})
export class GamesDirectory {
  @Prop({ type: SchemaTypes.String })
  _id: string; // gameAddress

  @Prop({ type: SchemaTypes.String, required: true, index: true })
  ownerAddress: string;

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

export type GameDocument = HydratedDocument<GamesDirectory>;

export const GamesDirectorySchema = SchemaFactory.createForClass(GamesDirectory);
