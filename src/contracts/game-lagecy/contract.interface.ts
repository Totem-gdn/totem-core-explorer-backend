import { BigNumber } from 'ethers';

export interface GameLegacyRecord {
  gameAddress: string;
  timestamp: BigNumber;
  data: string;
}

export interface CreateGameLegacy {
  gameAddress: string;
  data: string;
}
