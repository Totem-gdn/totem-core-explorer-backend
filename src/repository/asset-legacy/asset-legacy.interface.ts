import { AssetType } from '../../utils/enums';

export interface CreateAssetLegacy {
  assetType: AssetType;
  recordId: string;
  playerAddress: string;
  assetId: string;
  gameId: string;
  timestamp: number;
  data: string;
}

export interface AssetLegacyRecord {
  recordId: string;
  playerAddress: string;
  assetId: string;
  gameId: string;
  timestamp: number;
  data: string;
}

export interface FindAllQuery {
  assetType: AssetType;
  filters: {
    playerAddress?: string;
    assetId?: string;
    gameId?: string;
  };
  limit: number;
  offset: number;
}

export interface FindAllResult {
  total: number;
  limit: number;
  offset: number;
  results: AssetLegacyRecord[];
}

export interface FindByRecordId {
  assetType: AssetType;
  recordId: string;
}
