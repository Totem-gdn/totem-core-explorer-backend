import { GameStatus } from '../../utils/enums';
import { BigNumber } from 'ethers';

export interface GameRecord {
  ownerAddress: string;
  name: string;
  author: string;
  renderer: string;
  avatarFilter: string;
  itemFilter: string;
  gemFilter: string;
  website: string;
  createdAt: BigNumber;
  updatedAt: BigNumber;
  status: GameStatus;
}

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
  status: GameStatus;
}
