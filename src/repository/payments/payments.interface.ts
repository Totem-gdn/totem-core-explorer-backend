import { AssetType } from '../../utils/enums';

export interface CreateWithpaperPaymentLinkRequest {
  assetType: AssetType;
  ownerAddress: string;
  successUrl?: string;
}

export interface CreateWithpaperPaymentLinkResponse {
  orderId: string;
  url: string;
}

export interface PaymentInfoResponse {
  address: string;
  token: string;
  price: string;
}
