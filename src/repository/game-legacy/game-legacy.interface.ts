export interface CreateGameLegacy {
  recordId: string;
  gameAddress: string;
  timestamp: number;
  data: string;
}

export interface GameLegacyRecord {
  recordId: string;
  gameAddress: string;
  timestamp: number;
  data: string;
}

export interface FindAllQuery {
  filters: {
    gameAddress: string;
  };
  limit: number;
  offset: number;
}

export interface FindAllResult {
  total: number;
  limit: number;
  offset: number;
  results: GameLegacyRecord[];
}

export interface FindByRecordId {
  recordId: string;
}
