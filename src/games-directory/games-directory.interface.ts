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
  assetFilter: string;
  gemFilter: string;
  website: string;
  createdAt: Long;
  updatedAt: Long;
  status: GameStatus;
}

export type Empty = Record<string, never>;

export interface CreateGameRequest {
  owner: string;
  name: string;
  author: string;
  renderer: string;
  avatarFilter: string;
  assetFilter: string;
  gemFilter: string;
  website: string;
  status: GameStatus;
}

export interface CreateGameResponse {
  txHash: string;
}

export interface UpdateGameOwnerRequest {
  recordId: string;
  owner: string;
}

export interface UpdateGameNameRequest {
  recordId: string;
  name: string;
}

export interface UpdateGameAuthorRequest {
  recordId: string;
  author: string;
}

export interface UpdateGameRendererRequest {
  recordId: string;
  renderer: string;
}

export interface UpdateGameAvatarFilterRequest {
  recordId: string;
  avatar_filter: string;
}

export interface UpdateGameAssetFilterRequest {
  recordId: string;
  asset_filter: string;
}

export interface UpdateGameGemFilterRequest {
  recordId: string;
  gem_filter: string;
}

export interface UpdateGameWebsiteRequest {
  recordId: string;
  website: string;
}

export interface UpdateGameStatusRequest {
  recordId: string;
  status: GameStatus;
}

export interface GamesDirectory {
  Create(request: CreateGameRequest): Observable<CreateGameResponse>;

  UpdateGameOwner(request: UpdateGameOwnerRequest): Observable<Empty>;

  UpdateGameName(request: UpdateGameNameRequest): Observable<Empty>;

  UpdateGameAuthor(request: UpdateGameAuthorRequest): Observable<Empty>;

  UpdateGameRenderer(request: UpdateGameRendererRequest): Observable<Empty>;

  UpdateGameAvatarFilter(request: UpdateGameAvatarFilterRequest): Observable<Empty>;

  UpdateGameAssetFilter(request: UpdateGameAssetFilterRequest): Observable<Empty>;

  UpdateGameGemFilter(request: UpdateGameGemFilterRequest): Observable<Empty>;

  UpdateGameWebsite(request: UpdateGameWebsiteRequest): Observable<Empty>;

  UpdateGameStatus(request: UpdateGameStatusRequest): Observable<Empty>;
}
