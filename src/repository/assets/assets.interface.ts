import { AssetType } from '../../utils/enums';

export interface ClaimAssetRequest {
  ownerAddress: string;
  assetType: AssetType;
}

export interface ClaimAssetResponse {
  txHash: string;
}
