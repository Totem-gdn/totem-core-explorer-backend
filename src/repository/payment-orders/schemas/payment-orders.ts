import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { DocumentTimestamps } from '../../utils/document';
import { AssetType, PaymentStatuses, PaymentSystem } from '../../../utils/enums';

@Schema({
  autoCreate: true,
  collection: 'paymentOrders',
  _id: false,
  timestamps: { createdAt: true, updatedAt: true },
})
export class PaymentOrder {
  @Prop({ type: SchemaTypes.String })
  _id: string;

  @Prop({ type: SchemaTypes.String, required: true, index: true })
  ownerAddress: string;

  @Prop({ type: SchemaTypes.Number, required: true })
  assetType: AssetType;

  @Prop({ type: SchemaTypes.Number, required: true })
  status: PaymentStatuses;

  @Prop({ type: SchemaTypes.Number })
  paymentSystem: PaymentSystem;

  @Prop({ type: SchemaTypes.String, required: true })
  price: string;

  @Prop({ type: SchemaTypes.String, default: () => '' })
  txHash: string;
}

export type PaymentOrderDocument = HydratedDocument<PaymentOrder & DocumentTimestamps>;

export const PaymentOrderSchema = SchemaFactory.createForClass(PaymentOrder);
