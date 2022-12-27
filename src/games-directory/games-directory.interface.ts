import { Observable } from 'rxjs';
import { Long } from '@grpc/proto-loader';

import { GameStatus } from '../utils/enums';

export interface GameRecord {
  recordId: string;
  owner: string;
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
  owner: string;
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
  recordId: string;
  owner?: string;
  name?: string;
  author?: string;
  renderer?: string;
  avatarFilter?: string;
  itemFilter?: string;
  gemFilter?: string;
  website?: string;
  status?: GameStatus;
}

export interface UpdateGameResponse {
  ownerTxHash?: string;
  nameTxHash?: string;
  authorTxHash?: string;
  rendererTxHash?: string;
  avatarFilterTxHash?: string;
  itemFilterTxHash?: string;
  gemFilterTxHash?: string;
  websiteTxHash?: string;
  statusTxHash?: string;
}

export interface FindAllRequest {
  filters: {
    owner?: string;
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

export interface GamesDirectory {
  Create(request: CreateGameRequest): Observable<CreateGameResponse>;

  Update(request: UpdateGameRequest): Observable<UpdateGameResponse>;

  FindAll(request: FindAllRequest): Observable<FindAllResponse>;

  FindById(request: FindByIdRequest): Observable<FindByIdResponse>;
}
