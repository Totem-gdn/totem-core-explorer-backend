import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { DocumentTimestamps } from '../../utils/document';
import { AssetType } from '../../../utils/enums';

const transform = (doc: AssetDocument) => ({
  assetType: doc._id,
  contractAddress: doc.contractAddress,
  price: doc.price,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

@Schema({
  autoCreate: true,
  collection: 'assets',
  _id: false,
  timestamps: true,
  toJSON: { transform },
  toObject: { transform },
})
export class Asset {
  @Prop({ type: SchemaTypes.Number })
  _id: AssetType;

  @Prop({ type: SchemaTypes.String, requires: true, unique: true })
  contractAddress: string;

  @Prop({ type: SchemaTypes.String, required: true })
  price: string;
}

export type AssetDocument = HydratedDocument<Asset & DocumentTimestamps>;

export const AssetSchema = SchemaFactory.createForClass(Asset);
