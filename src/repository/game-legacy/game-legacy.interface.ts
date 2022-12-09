export interface CreateGameLegacy {
  recordId: string;
  gameId: string;
  timestamp: number;
  data: string;
}

export interface GameLegacyRecord {
  recordId: string;
  gameId: string;
  timestamp: number;
  data: string;
}

export interface FindAllQuery {
  filters: {
    gameId: string;
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
