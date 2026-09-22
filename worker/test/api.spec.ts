import { env, SELF } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import worker from "../src/index";

const keyed = {
  headers: { "X-API-Key": "workshop-key" },
};

beforeAll(async () => {
  await env.DB
    .prepare(
      "CREATE TABLE IF NOT EXISTS sets (set_number TEXT PRIMARY KEY, name TEXT NOT NULL, theme TEXT NOT NULL, year INTEGER NOT NULL, piece_count INTEGER NOT NULL, image_url TEXT NOT NULL)",
    )
    .run();
});

beforeEach(async () => {
  await env.DB.prepare("DELETE FROM sets").run();
  await env.DB
    .prepare(
      "INSERT INTO sets (set_number, name, theme, year, piece_count, image_url) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind("001-1", "Gears", "Technic", 1965, 43, "https://cdn.example/001-1.jpg")
    .run();
  await env.DB
    .prepare(
      "INSERT INTO sets (set_number, name, theme, year, piece_count, image_url) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind("002-1", "Classic Brick Box", "Classic", 1966, 50, "https://cdn.example/002-1.jpg")
    .run();
  await env.DB
    .prepare(
      "INSERT INTO sets (set_number, name, theme, year, piece_count, image_url) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind("003-1", "Gear Set", "Technic", 1967, 60, "https://cdn.example/003-1.jpg")
    .run();
});

describe("Worker API", () => {
  it("keeps health public", async () => {
    const response = await SELF.fetch("https://example.test/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("rejects a missing API key", async () => {
    const response = await SELF.fetch("https://example.test/sets");

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: { code: "unauthorized", message: "Unauthorized" },
    });
  });

  it("rejects an invalid API key", async () => {
    const response = await SELF.fetch("https://example.test/sets", {
      headers: { "X-API-Key": "wrong-key" },
    });

    expect(response.status).toBe(401);
  });

  it("rejects invalid pagination", async () => {
    const response = await SELF.fetch("https://example.test/sets?page=0", keyed);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: { code: "invalid_query", message: "page must be at least 1" },
    });
  });

  it("rejects limits outside the supported range", async () => {
    const tooSmall = await SELF.fetch("https://example.test/sets?limit=0", keyed);
    const tooLarge = await SELF.fetch("https://example.test/sets?limit=101", keyed);

    expect(tooSmall.status).toBe(400);
    await expect(tooSmall.json()).resolves.toEqual({
      error: { code: "invalid_query", message: "limit must be at least 1" },
    });
    expect(tooLarge.status).toBe(400);
    await expect(tooLarge.json()).resolves.toEqual({
      error: { code: "invalid_query", message: "limit must not exceed 100" },
    });
  });

  it("returns paginated public set fields without exposing the API key", async () => {
    const response = await SELF.fetch("https://example.test/sets?page=1&limit=20", keyed);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      items: [
        {
          setNumber: "001-1",
          name: "Gears",
          theme: "Technic",
          year: 1965,
          pieceCount: 43,
          imageUrl: "https://cdn.example/001-1.jpg",
        },
        {
          setNumber: "002-1",
          name: "Classic Brick Box",
          theme: "Classic",
          year: 1966,
          pieceCount: 50,
          imageUrl: "https://cdn.example/002-1.jpg",
        },
        {
          setNumber: "003-1",
          name: "Gear Set",
          theme: "Technic",
          year: 1967,
          pieceCount: 60,
          imageUrl: "https://cdn.example/003-1.jpg",
        },
      ],
      page: 1,
      limit: 20,
      total: 3,
    });
    expect(JSON.stringify(body)).not.toContain("workshop-key");
  });

  it("filters search and theme before calculating total", async () => {
    const response = await SELF.fetch(
      "https://example.test/sets?search=gear&theme=Technic",
      keyed,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      total: 2,
      items: [
        expect.objectContaining({ setNumber: "001-1" }),
        expect.objectContaining({ setNumber: "003-1" }),
      ],
    });
  });

  it("treats SQL-pattern input as a literal filter value", async () => {
    const response = await SELF.fetch(
      "https://example.test/sets?search=%27%20OR%201%3D1%20--&theme=%27%20OR%201%3D1%20--",
      keyed,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ items: [], total: 0 });
  });

  it("returns an empty filtered page", async () => {
    const response = await SELF.fetch("https://example.test/sets?theme=Space", keyed);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
    });
  });

  it("returns a set by number", async () => {
    const response = await SELF.fetch("https://example.test/sets/001-1", keyed);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      setNumber: "001-1",
      name: "Gears",
      theme: "Technic",
      year: 1965,
      pieceCount: 43,
      imageUrl: "https://cdn.example/001-1.jpg",
    });
  });

  it("returns a stable missing-set response", async () => {
    const response = await SELF.fetch("https://example.test/sets/does-not-exist", keyed);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: "not_found", message: "Set not found" },
    });
  });

  it("returns a stable error when D1 is unavailable", async () => {
    const response = await worker.fetch(
      new Request("https://example.test/sets", keyed),
      { ...env, DB: undefined as unknown as D1Database },
      {} as ExecutionContext,
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: { code: "internal_error", message: "Internal server error" },
    });
  });

  it("rate limits a keyed endpoint request with the standard error body", async () => {
    const rateLimitedEnv = { ...env, RATE_LIMIT_MAX_REQUESTS: "1" };
    const first = await worker.fetch(
      new Request("https://example.test/sets", keyed),
      rateLimitedEnv,
      {} as ExecutionContext,
    );
    const second = await worker.fetch(
      new Request("https://example.test/sets", keyed),
      rateLimitedEnv,
      {} as ExecutionContext,
    );

    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
    await expect(second.json()).resolves.toEqual({
      error: { code: "rate_limited", message: "Too many requests" },
    });
  });
});
