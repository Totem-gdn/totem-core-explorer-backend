import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

import { DocumentTimestamps } from '../../utils/document';

@Schema({
  autoCreate: true,
  autoIndex: true,
  collection: 'publisher',
  _id: false,
  timestamps: true,
})
export class Publisher {
  @Prop({ type: SchemaTypes.String })
  _id: string; // address | ObjectId | uuid4

  @Prop({ type: SchemaTypes.String, required: true, unique: true, index: true })
  apiKey: string;

  @Prop({ type: SchemaTypes.String, required: true, unique: true })
  name: string;

  @Prop({ type: SchemaTypes.String, default: () => '' })
  webhookUrl: string;
}

export type PublisherDocument = HydratedDocument<Publisher & DocumentTimestamps>;

export const PublisherSchema = SchemaFactory.createForClass(Publisher);
