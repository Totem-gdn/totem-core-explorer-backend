import { Observable } from 'rxjs';
import { AssetType } from '../utils/enums';

export interface CreateRequest {
  assetType: AssetType;
  contractAddress: string;
  price: string;
}

export interface UpdateRequest {
  assetType: AssetType;
  contractAddress?: string;
  price?: string;
}

export interface InfoRequest {
  assetType: AssetType;
}

export interface InfoResponse {
  contractAddress: string;
  price: string;
}

export interface ClaimRequest {
  ownerAddress: string;
  assetType: AssetType;
}

export interface ClaimResponse {
  txHash: string;
}

export interface Assets {
  Create(request: CreateRequest): Observable<void>;

  Update(request: UpdateRequest): Observable<void>;

  Info(request: InfoRequest): Observable<InfoResponse>;

  Claim(request: ClaimRequest): Observable<ClaimResponse>;
}
