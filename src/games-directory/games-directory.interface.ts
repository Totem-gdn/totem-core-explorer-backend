import { Observable } from 'rxjs';
import { Long } from '@grpc/proto-loader';

import { GameStatus } from '../utils/enums';

export interface GameRecord {
  gameAddress: string;
  ownerAddress: string;
  name: string;
  author: string;
  renderer: string;
  avatarFilter: string;
  itemFilter: string;
  gemFilter: string;
  website: string;
  createdAt: Long;
  updatedAt: Long;
  status: GameStatus;
}

export interface CreateGameRequest {
  gameAddress: string;
  ownerAddress: string;
  name: string;
  author: string;
  renderer: string;
  avatarFilter: string;
  itemFilter: string;
  gemFilter: string;
  website: string;
  status: GameStatus;
}

export interface CreateGameResponse {
  txHash: string;
}

export interface UpdateGameRequest {
  gameAddress: string;
  ownerAddress: string;
  name: string;
  author: string;
  renderer: string;
  avatarFilter: string;
  itemFilter: string;
  gemFilter: string;
  website: string;
  status: GameStatus;
}

export interface UpdateGameResponse {
  txHash: string;
}

export interface FindAllRequest {
  filters: {
    ownerAddress?: string;
    status?: GameStatus;
  };
  limit: Long;
  offset: Long;
}

export interface FindAllResponse {
  total: Long;
  limit: Long;
  offset: Long;
  results: GameRecord[];
}

export interface FindByIdRequest {
  recordId: string;
}

export interface FindByIdResponse {
  record: GameRecord;
}

export interface FindByAddressRequest {
  gameAddress: string;
}

export interface FindByAddressResponse {
  record: GameRecord;
}

export interface GamesDirectory {
  Create(request: CreateGameRequest): Observable<CreateGameResponse>;

  Update(request: UpdateGameRequest): Observable<UpdateGameResponse>;

  FindAll(request: FindAllRequest): Observable<FindAllResponse>;

  FindById(request: FindByIdRequest): Observable<FindByIdResponse>;

  FindByAddress(request: FindByAddressRequest): Observable<FindByAddressResponse>;
}
