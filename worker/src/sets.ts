import type { ListQuery, PaginatedSets, SetRecord } from "./types";

type SetRow = {
  setNumber: string;
  name: string;
  theme: string;
  year: number;
  pieceCount: number;
  imageUrl: string;
};

export function parseListQuery(url: URL): ListQuery {
  const page = parsePositiveInteger(url.searchParams.get("page"), 1, "page");
  const limit = parsePositiveInteger(url.searchParams.get("limit"), 20, "limit");

  if (limit > 100) {
    throw new RangeError("limit must not exceed 100");
  }

  const search = url.searchParams.get("search")?.trim() || undefined;
  const theme = url.searchParams.get("theme")?.trim() || undefined;

  return { page, limit, search, theme };
}

export async function listSets(db: D1Database, query: ListQuery): Promise<PaginatedSets> {
  const filters: string[] = [];
  const values: string[] = [];

  if (query.search) {
    filters.push("name LIKE ? COLLATE NOCASE");
    values.push(`%${query.search}%`);
  }
  if (query.theme) {
    filters.push("theme LIKE ? COLLATE NOCASE");
    values.push(`%${query.theme}%`);
  }

  const where = filters.length ? ` WHERE ${filters.join(" AND ")}` : "";
  const offset = (query.page - 1) * query.limit;
  const [itemsResult, totalResult] = await Promise.all([
    db
      .prepare(
        `SELECT set_number AS setNumber, name, theme, year, piece_count AS pieceCount, image_url AS imageUrl FROM sets${where} ORDER BY set_number LIMIT ? OFFSET ?`,
      )
      .bind(...values, query.limit, offset)
      .all<SetRow>(),
    db.prepare(`SELECT COUNT(*) AS total FROM sets${where}`).bind(...values).first<{ total: number }>(),
  ]);

  return {
    items: itemsResult.results,
    page: query.page,
    limit: query.limit,
    total: totalResult?.total ?? 0,
  };
}

export async function getSet(db: D1Database, setNumber: string): Promise<SetRecord | null> {
  return db
    .prepare(
      "SELECT set_number AS setNumber, name, theme, year, piece_count AS pieceCount, image_url AS imageUrl FROM sets WHERE set_number = ?",
    )
    .bind(setNumber)
    .first<SetRow>();
}

function parsePositiveInteger(value: string | null, fallback: number, name: string): number {
  if (value === null) return fallback;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new RangeError(`${name} must be at least 1`);
  }
  return parsed;
}
