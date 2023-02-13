import { Observable } from 'rxjs';

import { AssetType } from '../utils/enums';

export interface CreateWithpaperPaymentLinkRequest {
  assetType: AssetType;
  ownerAddress: string;
  successUrl?: string;
}

export interface CreateWithpaperPaymentLinkResponse {
  orderId: string;
  url: string;
}

export interface ProcessWithpaperWebhookRequest {
  txHash?: string;
  orderId: string;
  event: string;
}

export interface Payments {
  CreateWithpaperPaymentLink(
    request: CreateWithpaperPaymentLinkRequest,
  ): Observable<CreateWithpaperPaymentLinkResponse>;

  ProcessWithpaperWebhook(request: ProcessWithpaperWebhookRequest): Observable<void>;
}
