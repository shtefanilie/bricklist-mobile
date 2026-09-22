import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const setHeaders = ["set_num", "name", "year", "theme_id", "num_parts", "img_url"];
const themeHeaders = ["id", "name", "parent_id"];
const batchSize = 500;

export type SetRow = {
  setNumber: string;
  name: string;
  year: number;
  theme: string;
  pieceCount: number;
  imageUrl: string;
};

type CsvRow = {
  fields: string[];
  line: number;
};

function parseCsv(source: string): CsvRow[] {
  const rows: CsvRow[] = [];
  let fields: string[] = [];
  let value = "";
  let inQuotes = false;
  let line = 1;
  let rowLine = 1;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (inQuotes) {
      if (character === '"' && source[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        inQuotes = false;
      } else {
        value += character;
        if (character === "\n") line += 1;
      }
      continue;
    }

    if (character === '"') {
      if (value !== "") throw new Error(`CSV row ${line}: unexpected quote`);
      inQuotes = true;
    } else if (character === ",") {
      fields.push(value);
      value = "";
    } else if (character === "\n") {
      fields.push(value.replace(/\r$/, ""));
      rows.push({ fields, line: rowLine });
      fields = [];
      value = "";
      line += 1;
      rowLine = line;
    } else {
      value += character;
    }
  }

  if (inQuotes) throw new Error(`CSV row ${rowLine}: unterminated quote`);
  if (value !== "" || fields.length > 0) {
    fields.push(value.replace(/\r$/, ""));
    rows.push({ fields, line: rowLine });
  }

  return rows;
}

function parseTable(source: string, headers: string[], label: string): CsvRow[] {
  const rows = parseCsv(source.replace(/^\uFEFF/, ""));
  const [header, ...data] = rows;

  if (!header || header.fields.length !== headers.length || header.fields.some((field, index) => field !== headers[index])) {
    throw new Error(`${label} header must be ${headers.join(",")}`);
  }

  return data.filter((row) => row.fields.some((field) => field !== ""));
}

function requireText(value: string | undefined, label: string, row: number): string {
  if (!value) throw new Error(`${label} row ${row}: missing value`);
  return value;
}

function requireInteger(value: string | undefined, label: string, row: number): number {
  if (!value || !/^-?\d+$/.test(value)) {
    throw new Error(`${label} row ${row}: expected an integer`);
  }
  return Number(value);
}

export function buildSetRows(setsCsv: string, themesCsv: string): SetRow[] {
  const themes = new Map<string, string>();

  for (const row of parseTable(themesCsv, themeHeaders, "themes")) {
    if (row.fields.length !== themeHeaders.length) {
      throw new Error(`themes row ${row.line}: expected ${themeHeaders.length} columns`);
    }
    const id = requireText(row.fields[0], "themes", row.line);
    const name = requireText(row.fields[1], "themes", row.line);
    if (themes.has(id)) throw new Error(`themes row ${row.line}: duplicate theme ID ${id}`);
    themes.set(id, name);
  }

  const rows: SetRow[] = [];
  const setNumbers = new Set<string>();
  for (const row of parseTable(setsCsv, setHeaders, "sets")) {
    if (row.fields.length !== setHeaders.length) {
      throw new Error(`sets row ${row.line}: expected ${setHeaders.length} columns`);
    }

    const setNumber = requireText(row.fields[0], "sets", row.line);
    if (setNumbers.has(setNumber)) throw new Error(`sets row ${row.line}: duplicate set_num ${setNumber}`);
    const themeId = requireText(row.fields[3], "sets", row.line);
    const theme = themes.get(themeId);
    if (!theme) throw new Error(`sets row ${row.line}: unknown theme ID ${themeId}`);

    rows.push({
      setNumber,
      name: requireText(row.fields[1], "sets", row.line),
      year: requireInteger(row.fields[2], "sets", row.line),
      theme,
      pieceCount: requireInteger(row.fields[4], "sets", row.line),
      imageUrl: requireText(row.fields[5], "sets", row.line),
    });
    setNumbers.add(setNumber);
  }

  return rows;
}

function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

export function buildSeedSql(rows: SetRow[]): string {
  const batches: string[] = [];
  for (let start = 0; start < rows.length; start += batchSize) {
    const values = rows.slice(start, start + batchSize).map((row) =>
      `(${sqlString(row.setNumber)}, ${sqlString(row.name)}, ${sqlString(row.theme)}, ${row.year}, ${row.pieceCount}, ${sqlString(row.imageUrl)})`,
    );
    batches.push(`INSERT OR REPLACE INTO sets (set_number, name, theme, year, piece_count, image_url)\nVALUES ${values.join(",\n")};`);
  }
  return batches.length === 0 ? "" : `${batches.join("\n")}\n`;
}

async function main(): Promise<void> {
  const workerDirectory = dirname(fileURLToPath(import.meta.url));
  const rootDirectory = resolve(workerDirectory, "../..");
  const setsCsv = await readFile(resolve(rootDirectory, "data/raw/sets.csv"), "utf8");
  const themesCsv = await readFile(resolve(rootDirectory, "data/raw/themes.csv"), "utf8");
  const output = resolve(rootDirectory, "worker/generated/seed-sets.sql");

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, buildSeedSql(buildSetRows(setsCsv, themesCsv)), "utf8");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
