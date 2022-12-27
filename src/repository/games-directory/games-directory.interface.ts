import { GameStatus } from '../../utils/enums';

export interface CreateGameRecord {
  recordId: string;
  owner: string;
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
  recordId: string;
  updatedField: string;
  data: string | GameStatus;
  updatedAt: number;
}

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
  createdAt: number;
  updatedAt: number;
  status: GameStatus;
}

export interface FindAllQuery {
  filters: {
    owner?: string;
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

export interface FindByRecordId {
  recordId: string;
}
