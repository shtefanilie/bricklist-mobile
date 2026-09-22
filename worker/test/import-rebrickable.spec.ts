import { describe, expect, it } from "vitest";

import { buildSetRows, buildSeedSql } from "../scripts/import-rebrickable.mts";

const themesCsv = `id,name,parent_id
1,Technic,
2,Classic,
`;

const setsCsv = `set_num,name,year,theme_id,num_parts,img_url
001-1,Gears,1965,1,43,https://cdn.example/001-1.jpg
`;

describe("Rebrickable import", () => {
  it("maps set fields and theme IDs into D1 rows", () => {
    expect(buildSetRows(setsCsv, themesCsv)).toEqual([
      {
        setNumber: "001-1",
        name: "Gears",
        year: 1965,
        theme: "Technic",
        pieceCount: 43,
        imageUrl: "https://cdn.example/001-1.jpg",
      },
    ]);
  });

  it("names the source row for an unknown theme ID", () => {
    const input = setsCsv.replace(",1,43,", ",999,43,");

    expect(() => buildSetRows(input, themesCsv)).toThrow("sets row 2");
  });

  it("names the source row for a non-numeric year", () => {
    const input = setsCsv.replace(",1965,", ",nineteen sixty-five,");

    expect(() => buildSetRows(input, themesCsv)).toThrow("sets row 2");
  });

  it("names the source row for a duplicate set number", () => {
    const input = `${setsCsv}001-1,More Gears,1966,1,44,https://cdn.example/001-1b.jpg\n`;

    expect(() => buildSetRows(input, themesCsv)).toThrow("sets row 3");
  });

  it("rejects an unexpected sets header", () => {
    const input = setsCsv.replace("set_num", "set_number");

    expect(() => buildSetRows(input, themesCsv)).toThrow("sets header");
  });

  it("escapes SQL strings and wraps inserts in a transaction", () => {
    const rows = buildSetRows(
      setsCsv.replace("Gears", "Builder's Gears"),
      themesCsv,
    );

    expect(buildSeedSql(rows)).toBe(`BEGIN TRANSACTION;
INSERT OR REPLACE INTO sets (set_number, name, theme, year, piece_count, image_url)
VALUES ('001-1', 'Builder''s Gears', 'Technic', 1965, 43, 'https://cdn.example/001-1.jpg');
COMMIT;
`);
  });

  it("splits seed SQL into transactions of at most 500 values", () => {
    const makeRows = (count: number) =>
      Array.from({ length: count }, (_, index) => ({
        setNumber: `${index}-1`,
        name: `Set ${index}`,
        year: 2000,
        theme: "Technic",
        pieceCount: index,
        imageUrl: `https://cdn.example/${index}-1.jpg`,
      }));
    const transactions = (rows: ReturnType<typeof makeRows>) =>
      buildSeedSql(rows)
        .split("COMMIT;")
        .filter((transaction) => transaction.trim() !== "");
    const valueCount = (transaction: string) =>
      transaction.slice(transaction.indexOf("VALUES ") + "VALUES ".length).match(/\(/g)?.length;

    expect(transactions(makeRows(500))).toHaveLength(1);
    expect(valueCount(transactions(makeRows(500))[0])).toBe(500);
    expect(transactions(makeRows(501))).toHaveLength(2);
    expect(transactions(makeRows(501)).map(valueCount)).toEqual([500, 1]);
  });
});
