import { Observable } from 'rxjs';
import { Long } from '@grpc/proto-loader';

export interface GameLegacyRecord {
  recordId: string;
  gameId: string;
  timestamp: Long;
  data: string;
}

export type Empty = Record<string, never>;

export interface CreateGameLegacyRequest {
  gameId: string;
  data: string;
}

export interface FindAllRequest {
  filters: {
    gameId: string;
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
  Create(request: CreateGameLegacyRequest): Observable<Empty>;

  FindAll(request: FindAllRequest): Observable<FindAllResponse>;

  FindById(request: FindByIdRequest): Observable<FindByIdResponse>;
}
