import { Observable } from 'rxjs';

import { AssetType } from '../../utils/enums';

export interface CreatePaymentLinkRequest {
  assetType: AssetType;
  ownerAddress: string;
  successUrl?: string;
  imageUrl?: string;
  redirect: boolean;
}

export interface CreatePaymentLinkResponse {
  orderId: string;
  url: string;
}

export interface ProcessWebhookRequest {
  orderId: string;
  event: string;
  txHash: string;
}

export interface Withpaper {
  CreatePaymentLink(request: CreatePaymentLinkRequest): Observable<CreatePaymentLinkResponse>;

  ProcessWebhook(request: ProcessWebhookRequest): Observable<void>;
}
