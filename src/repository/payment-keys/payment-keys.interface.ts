import { AssetType, PaymentKeyStatus } from '../../utils/enums';

export interface CreatePaymentKeys {
  apiKey: string;
  assetType: AssetType;
  amount: number;
}

export interface ClaimPaymentKey {
  apiKey: string;
  player: string;
  assetType: AssetType;
}

export interface PaymentKeysStatus {
  apiKey: string;
  assetType: AssetType;
  status: PaymentKeyStatus;
}
