import { Observable } from 'rxjs';
import { Long } from '@grpc/proto-loader';

import { AssetType } from '../utils/enums';

export interface AssetLegacyRecord {
  recordId: string;
  playerAddress: string;
  assetId: string;
  gameAddress: string;
  timestamp: Long;
  data: string;
}

export interface CreateAssetLegacyRequest {
  assetType: AssetType;
  playerAddress: string;
  assetId: string;
  gameAddress: string;
  data: string;
}

export interface CreateAssetLegacyResponse {
  txHash: string;
}

export interface FindAllRequest {
  assetType: AssetType;
  filters: {
    playerAddress: string;
    assetId: string;
    gameAddress: string;
  };
  limit: Long;
  offset: Long;
}

export interface FindAllResponse {
  total: Long;
  limit: Long;
  offset: Long;
  results: AssetLegacyRecord[];
}

export interface FindByIdRequest {
  assetType: AssetType;
  recordId: string;
}

export interface FindByIdResponse {
  record: AssetLegacyRecord;
}

export interface AssetLegacy {
  Create(request: CreateAssetLegacyRequest): Observable<CreateAssetLegacyResponse>;

  FindAll(request: FindAllRequest): Observable<FindAllResponse>;

  FindById(request: FindByIdRequest): Observable<FindByIdResponse>;
}
