import { GameStatus } from '../../utils/enums';
import { BigNumber } from 'ethers';

export interface GameRecord {
  owner: string;
  game: {
    name: string;
    author: string;
    renderer: string;
    avatarFilter: string;
    itemFilter: string;
    gemFilter: string;
    website: string;
    createdAt: BigNumber;
    updatedAt: BigNumber;
  };
  status: GameStatus;
}

export interface CreateGameRecord {
  owner: string;
  game: {
    name: string;
    author: string;
    renderer: string;
    avatarFilter: string;
    itemFilter: string;
    gemFilter: string;
    website: string;
  };
  status: GameStatus;
}
