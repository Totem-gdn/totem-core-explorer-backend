import { BigNumber } from 'ethers';

export interface AssetLegacyRecord {
  assetId: BigNumber;
  gameId: BigNumber;
  timestamp: BigNumber;
  data: string;
}

export interface CreateAssetLegacy {
  playerAddress: string;
  assetId: string;
  gameId: string;
  data: string;
}
