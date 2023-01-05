import { Observable } from 'rxjs';
import { Long } from '@grpc/proto-loader';

export interface GameLegacyRecord {
  recordId: string;
  gameAddress: string;
  timestamp: Long;
  data: string;
}

export interface CreateGameLegacyRequest {
  gameAddress: string;
  data: string;
}

export interface CreateGameLegacyResponse {
  txHash: string;
}

export interface FindAllRequest {
  filters: {
    gameAddress: string;
  };
  limit: Long;
  offset: Long;
}

export interface FindAllResponse {
  total: Long;
  limit: Long;
  offset: Long;
  results: GameLegacyRecord[];
}

export interface FindByIdRequest {
  recordId: string;
}

export interface FindByIdResponse {
  record: GameLegacyRecord;
}

export interface GameLegacy {
  Create(request: CreateGameLegacyRequest): Observable<CreateGameLegacyResponse>;

  FindAll(request: FindAllRequest): Observable<FindAllResponse>;

  FindById(request: FindByIdRequest): Observable<FindByIdResponse>;
}
