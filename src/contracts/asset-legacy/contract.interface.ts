import { BigNumber } from 'ethers';

export interface AssetLegacyRecord {
  assetId: BigNumber;
  gameAddress: string;
  timestamp: BigNumber;
  data: string;
}

export interface CreateAssetLegacy {
  playerAddress: string;
  gameAddress: string;
  assetId: string;
  data: string;
}
