export interface Env {
  DB: D1Database;
  WORKSHOP_API_KEY_SHA256: string;
}

export interface SetRecord {
  setNumber: string;
  name: string;
  theme: string;
  year: number;
  pieceCount: number;
  imageUrl: string;
}

export interface PaginatedSets {
  items: SetRecord[];
  page: number;
  limit: number;
  total: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface ListQuery {
  page: number;
  limit: number;
  search?: string;
  theme?: string;
}
