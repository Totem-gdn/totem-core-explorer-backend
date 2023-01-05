import { GameStatus } from '../../utils/enums';

export interface CreateGameRecord {
  gameAddress: string;
  ownerAddress: string;
  name: string;
  author: string;
  renderer: string;
  avatarFilter: string;
  itemFilter: string;
  gemFilter: string;
  website: string;
  createdAt: number;
  updatedAt: number;
  status: GameStatus;
}

export interface UpdateGameRecord {
  gameAddress: string;
  ownerAddress: string;
  name: string;
  author: string;
  renderer: string;
  avatarFilter: string;
  itemFilter: string;
  gemFilter: string;
  website: string;
  updatedAt: number;
  status: GameStatus;
}

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
  createdAt: number;
  updatedAt: number;
  status: GameStatus;
}

export interface FindAllQuery {
  filters: {
    ownerAddress?: string;
    status?: GameStatus;
  };
  limit: number;
  offset: number;
}

export interface FindAllResult {
  total: number;
  limit: number;
  offset: number;
  results: GameRecord[];
}

export interface FindByAddress {
  gameAddress: string;
}
