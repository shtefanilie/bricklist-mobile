export type SetRecord = {
  setNumber: string;
  name: string;
  theme: string;
  year: number;
  pieceCount: number;
  imageUrl: string;
};

export type PaginatedSets = {
  items: SetRecord[];
  page: number;
  limit: number;
  total: number;
};
