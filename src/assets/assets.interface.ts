import { Observable } from 'rxjs';
import { AssetType } from '../utils/enums';

export interface ClaimAssetRequest {
  ownerAddress: string;
  assetType: AssetType;
}

export interface ClaimAssetResponse {
  txHash: string;
}

export interface Assets {
  ClaimAsset(request: ClaimAssetRequest): Observable<ClaimAssetResponse>;
}
