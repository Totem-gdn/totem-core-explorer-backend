import { GameStatus } from '../../utils/enums';

export interface CreateGameRecord {
  recordId: string;
  owner: string;
  name: string;
  author: string;
  renderer: string;
  avatarFilter: string;
  assetFilter: string;
  gemFilter: string;
  website: string;
  createdAt: number;
  updatedAt: number;
  status: GameStatus;
}

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
  createdAt: number;
  updatedAt: number;
  status: GameStatus;
}
