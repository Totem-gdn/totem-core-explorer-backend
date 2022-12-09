import { BigNumber } from 'ethers';

export interface GameLegacyRecord {
  gameId: BigNumber;
  timestamp: BigNumber;
  data: string;
}

export interface CreateGameLegacy {
  gameId: string;
  data: string;
}
