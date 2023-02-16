import { AssetType } from '../../utils/enums';

export interface AssetData {
  contractAddress: string;
  price: string;
}

export interface AssetRecord {
  assetType: AssetType;
  contractAddress: string;
  price: string;
  createdAt: string;
  updatedAt: string;
}
