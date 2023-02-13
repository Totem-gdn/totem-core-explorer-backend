import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';
import { DocumentTimestamps } from '../../utils/document';
import { AssetType, PaymentStatuses, PaymentSystem } from '../../../utils/enums';

@Schema({
  autoCreate: true,
  collection: 'orders',
  id: true,
  timestamps: { createdAt: true, updatedAt: true },
})
export class Order {
  @Prop({ type: SchemaTypes.String, required: true, index: true })
  ownerAddress: string;

  @Prop({ type: SchemaTypes.Number, required: true })
  assetType: AssetType;

  @Prop({ type: SchemaTypes.Number, required: true })
  status: PaymentStatuses;

  @Prop({ type: SchemaTypes.String, required: true })
  price: string;

  @Prop({ type: SchemaTypes.String, default: () => '' })
  txHash: string;

  @Prop({ type: SchemaTypes.Number })
  paymentSystem: PaymentSystem;
}

export type OrderDocument = Order & Document & DocumentTimestamps;

export const OrderSchema = SchemaFactory.createForClass(Order);
