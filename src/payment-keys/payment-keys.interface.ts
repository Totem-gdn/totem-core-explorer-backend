import { Observable } from 'rxjs';
import { Long } from '@grpc/proto-loader';

import { AssetType, PaymentKeyStatus } from '../utils/enums';

export interface CreatePaymentKeysRequest {
  apiKey: string;
  assetType: AssetType;
  amount: Long;
}

export interface ClaimPaymentKeyRequest {
  apiKey: string;
  playerAddress: string;
  assetType: AssetType;
}

export interface ClaimPaymentKeyResponse {
  txHash: string;
}

export interface PaymentKeysStatusRequest {
  apiKey: string;
  assetType: AssetType;
  status: PaymentKeyStatus;
}

export interface PaymentKeysStatusResponse {
  amount: Long;
}

export interface PaymentKeys {
  Create(request: CreatePaymentKeysRequest): Observable<void>;

  Claim(request: ClaimPaymentKeyRequest): Observable<ClaimPaymentKeyResponse>;

  Status(request: PaymentKeysStatusRequest): Observable<PaymentKeysStatusResponse>;
}
