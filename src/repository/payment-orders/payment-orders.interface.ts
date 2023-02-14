import { AssetType, PaymentStatuses, PaymentSystem } from '../../utils/enums';

export interface PaymentOrderData {
  ownerAddress: string;
  assetType: AssetType;
  status: PaymentStatuses;
  paymentSystem: PaymentSystem;
  price: string;
  txHash: string;
}
