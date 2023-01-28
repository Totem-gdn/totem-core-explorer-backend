import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

import { AssetType, PaymentKeyStatus } from '../../../utils/enums';
import { DocumentTimestamps } from '../../utils/document';

@Schema({
  autoCreate: true,
  collection: 'paymentKey',
  _id: false,
  timestamps: true,
})
export class PaymentKey {
  @Prop({ type: SchemaTypes.String })
  _id: string;

  @Prop({ type: SchemaTypes.String, required: true })
  publisher: string;

  @Prop({ type: SchemaTypes.Number, required: true })
  assetType: AssetType;

  @Prop({ type: SchemaTypes.Number, required: true, default: () => PaymentKeyStatus.Reserved })
  status: PaymentKeyStatus;

  @Prop({ type: SchemaTypes.String, default: () => '' })
  txHash: string;
}

export type PaymentKeyDocument = HydratedDocument<PaymentKey> & DocumentTimestamps;

export const PaymentKeySchema = SchemaFactory.createForClass(PaymentKey);
