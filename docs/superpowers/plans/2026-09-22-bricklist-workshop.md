# BrickList Workshop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a macOS-friendly Expo Go workshop app, a Cloudflare Worker/D1 LEGO sets API, and Frankie cross-tool setup guidance.

**Architecture:** The repository is an npm workspace with separate `app/` and `worker/` packages. The Worker reads a pre-imported D1 database through small, parameterised query helpers; the Expo app uses a deliberately basic `ScrollView` plus `.map()` and Previous/Next pagination. `FRANKIE.md` owns setup-agent behaviour; host instruction files only route to it.

**Tech Stack:** TypeScript, npm workspaces, Cloudflare Workers, D1, Wrangler, Vitest with `@cloudflare/vitest-pool-workers`, Expo Router, React Native, `jest-expo`.

## Global Constraints

- Keep the default app Expo Go-compatible on physical iOS and Android devices; do not add arbitrary custom native modules.
- The app is mobile-only. Do not configure CORS or Expo web support.
- The initial screen fetches `GET /sets?page=1&limit=20`, renders with `.map()`, shows every approved set field, and exposes only Previous/Next pagination and current-page text.
- Do not add artificial API latency, a list package, or a set-detail route.
- Use one shared workshop key from gitignored `.env.local`, sent in `X-API-Key`. Treat it as a temporary client-visible gate, never a production secret.
- API has no mutation endpoints. Use parameterised D1 queries, a maximum page size of `100`, and stable JSON errors for `400`, `401`, `404`, `429`, and `500`.
- Raw Rebrickable CSV is facilitator-only, lives at gitignored `data/raw/sets.csv` and `data/raw/themes.csv`, and is never committed. Attendees consume the already deployed API only.
- Worker and D1 are both named `bricklist-workshop`. Production provisioning/deployment is run by the workshop lead through their own authenticated Wrangler session.
- The teardown command must show its targets and require explicit confirmation. Never pass a non-interactive deletion flag.
- Frankie supports macOS only, checks Expo Go readiness first, offers native diagnostics only on request, and must ask before every install or system change.
- Frankie never handles credentials, signing certificates, device registration, account enrolment, unattended GUI installs, or destructive cleanup.

---

## File Structure

```text
package.json                              npm workspace root and orchestration scripts
.gitignore                                ignores raw CSV, local secrets, Expo/Worker artefacts
data/raw/sets.csv                         facilitator-provided raw Rebrickable sets input, ignored
data/raw/themes.csv                       facilitator-provided raw Rebrickable themes input, ignored
worker/package.json                       Worker dependencies and commands
worker/wrangler.jsonc                     `bricklist-workshop` Worker/D1 configuration
worker/src/index.ts                       HTTP routing, auth, response/error handling
worker/src/sets.ts                        query parsing and parameterised D1 queries
worker/src/types.ts                       D1 and JSON response types
worker/migrations/0001_create_sets.sql    D1 tables and indexes
worker/scripts/import-rebrickable.mts     CSV validation and deterministic D1 seed SQL generation
worker/scripts/teardown.mts               guarded Worker/D1 deletion launcher
worker/test/api.spec.ts                   Worker endpoint contract tests
worker/test/import-rebrickable.spec.ts    CSV import transformation tests
app/package.json                          Expo app dependencies and scripts
app/src/app/_layout.tsx                   Expo Router root layout
app/src/app/index.tsx                     intentionally basic paginated set screen
app/src/api.ts                            typed authenticated fetch client
app/src/types.ts                          API response types shared by screen/client
app/src/config.ts                         validates public API configuration
app/.env.example                          committed configuration template with no key
app/src/__tests__/api.test.ts             API client tests
app/src/__tests__/index.test.tsx          initial screen state and pagination tests
FRANKIE.md                                canonical conversational setup-agent instructions
CLAUDE.md                                 Claude Code routing adapter
AGENTS.md                                 OpenCode routing adapter
.github/copilot-instructions.md           Copilot CLI/VS Code routing adapter
README.md                                 facilitator setup, attendee startup, deployment and teardown docs
```

### Task 1: Establish Workspace, Data Boundaries, and Tooling

**Files:**
- Create: `package.json`
- Modify: `.gitignore`
- Move: `sets.csv` → `data/raw/sets.csv`
- Move: `themes.csv` → `data/raw/themes.csv`
- Create: `README.md`
- Create: `worker/package.json`
- Create: `app/package.json`

**Interfaces:**
- Produces npm workspaces named `@bricklist/worker` and `@bricklist/app`.
- Produces `data/raw/sets.csv` and `data/raw/themes.csv` as local facilitator inputs.
- Produces root commands `npm run worker:test`, `npm run worker:dev`, `npm run app:start`, and `npm run teardown`.

- [ ] **Step 1: Create the root workspace manifest**

```json
{
  "name": "bricklist-workshop",
  "private": true,
  "workspaces": ["app", "worker"],
  "scripts": {
    "worker:test": "npm run test --workspace=@bricklist/worker",
    "worker:dev": "npm run dev --workspace=@bricklist/worker",
    "app:start": "npm run start --workspace=@bricklist/app",
    "teardown": "npm run teardown --workspace=@bricklist/worker"
  }
}
```

- [ ] **Step 2: Move the facilitator CSV files and ignore all local inputs**

```gitignore
.worktrees/
data/raw/
.env.local
.dev.vars
node_modules/
.expo/
.wrangler/
coverage/
```

Create `data/raw/`, move the two supplied CSV files into it, then verify:

```bash
test -f data/raw/sets.csv
test -f data/raw/themes.csv
```

- [ ] **Step 3: Create minimal package manifests**

Create `worker/package.json` with the `@bricklist/worker` name, Wrangler/Vitest scripts, and the Worker test dependencies. Create `app/package.json` through `npx create-expo-app@latest app` using its current Expo Router TypeScript template, then set its package name to `@bricklist/app`.

Expected commands after installation:

```bash
npm install
npm run worker:test
npm run app:start
```

- [ ] **Step 4: Write facilitator/attendee README boundaries**

Document two separate paths:

```text
Facilitator: provide data/raw/*.csv, import D1, set Worker secret, deploy, then distribute URL/key outside Git.
Attendee: copy app/.env.example to app/.env.local, set public API URL/key from slides, npm install, npm run app:start, scan Expo QR.
```

Explicitly state that attendees do not download CSVs, run imports, provision Cloudflare, or run teardown.

- [ ] **Step 5: Verify baseline tooling**

Run:

```bash
npm install
npm run worker:test
```

Expected: dependencies install; Worker test runner starts with zero test failures.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore README.md worker/package.json app/package.json
git commit -m "chore: establish BrickList workspace"
```

### Task 2: Implement Rebrickable Import and D1 Schema

**Files:**
- Create: `worker/migrations/0001_create_sets.sql`
- Create: `worker/scripts/import-rebrickable.mts`
- Create: `worker/test/import-rebrickable.spec.ts`
- Modify: `worker/package.json`

**Interfaces:**
- Consumes `data/raw/sets.csv` with `set_num,name,year,theme_id,num_parts,img_url` and `data/raw/themes.csv` with `id,name,parent_id`.
- Produces `worker/generated/seed-sets.sql`, which is ignored and contains batched parameter-safe SQL literals.
- Provides `npm run import:data --workspace=@bricklist/worker` and `npm run d1:import --workspace=@bricklist/worker`.

- [ ] **Step 1: Write failing CSV transformation tests**

In `worker/test/import-rebrickable.spec.ts`, test a pure `buildSetRows` export using in-memory CSV strings:

```ts
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
```

Add failing cases for an unknown theme ID, non-numeric `year`, and a duplicate `set_num`; each must throw an error naming the bad row.

- [ ] **Step 2: Run the import test to verify failure**

Run:

```bash
npm run test --workspace=@bricklist/worker -- import-rebrickable.spec.ts
```

Expected: FAIL because `buildSetRows` does not exist.

- [ ] **Step 3: Add the D1 schema and indexes**

Create `worker/migrations/0001_create_sets.sql`:

```sql
CREATE TABLE IF NOT EXISTS sets (
  set_number TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  theme TEXT NOT NULL,
  year INTEGER NOT NULL,
  piece_count INTEGER NOT NULL,
  image_url TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sets_theme_idx ON sets(theme);
CREATE INDEX IF NOT EXISTS sets_name_idx ON sets(name);
```

- [ ] **Step 4: Implement deterministic import generation**

Implement `buildSetRows` and a CLI that reads the two raw files, validates headers, resolves theme IDs to names, rejects invalid/duplicate rows, escapes SQL string literals by doubling single quotes, and writes `worker/generated/seed-sets.sql` in transactions of 500 `INSERT OR REPLACE` values.

The generated SQL must target exactly:

```sql
INSERT OR REPLACE INTO sets (set_number, name, theme, year, piece_count, image_url)
```

- [ ] **Step 5: Verify import generation**

Run:

```bash
npm run import:data --workspace=@bricklist/worker
npm run test --workspace=@bricklist/worker -- import-rebrickable.spec.ts
```

Expected: a non-empty ignored `worker/generated/seed-sets.sql`; all import tests pass.

- [ ] **Step 6: Add local and remote import scripts**

Add scripts that run:

```bash
npx wrangler d1 migrations apply bricklist-workshop --local
npx wrangler d1 execute bricklist-workshop --local --file=generated/seed-sets.sql
```

Document matching `--remote` facilitator commands in `README.md`; do not run remote commands automatically.

- [ ] **Step 7: Commit**

```bash
git add worker/migrations worker/scripts worker/test worker/package.json README.md .gitignore
git commit -m "feat: add Rebrickable D1 import"
```

### Task 3: Implement and Test the Worker API

**Files:**
- Create: `worker/wrangler.jsonc`
- Create: `worker/src/types.ts`
- Create: `worker/src/sets.ts`
- Create: `worker/src/index.ts`
- Create: `worker/test/api.spec.ts`
- Modify: `worker/package.json`

**Interfaces:**
- Consumes D1 binding `DB` and Worker secret `WORKSHOP_API_KEY_SHA256`.
- Exposes `GET /health`, `GET /sets`, and `GET /sets/:setNumber`.
- `GET /sets` response is `{ items: SetRecord[], page: number, limit: number, total: number }`.
- Error response is `{ error: { code: string, message: string } }`.

- [ ] **Step 1: Write failing endpoint contract tests**

Use `@cloudflare/vitest-pool-workers` with seeded test D1 data. Cover:

```ts
expect((await SELF.fetch("https://example.test/health")).status).toBe(200);
expect((await SELF.fetch("https://example.test/sets")).status).toBe(401);
expect((await SELF.fetch("https://example.test/sets?page=0", keyed)).status).toBe(400);
expect((await SELF.fetch("https://example.test/sets?page=1&limit=20", keyed)).status).toBe(200);
expect((await SELF.fetch("https://example.test/sets/does-not-exist", keyed)).status).toBe(404);
```

Assert list item fields are `setNumber`, `name`, `theme`, `year`, `pieceCount`, and `imageUrl`; assert the response never exposes the key.

- [ ] **Step 2: Run endpoint tests to verify failure**

Run:

```bash
npm run test --workspace=@bricklist/worker -- api.spec.ts
```

Expected: FAIL because Worker entry point and routes do not exist.

- [ ] **Step 3: Implement types and query helpers**

Define `SetRecord`, `PaginatedSets`, and `ApiError` in `worker/src/types.ts`. Implement these functions in `worker/src/sets.ts`:

```ts
export function parseListQuery(url: URL): { page: number; limit: number; search?: string; theme?: string };
export async function listSets(db: D1Database, query: ListQuery): Promise<PaginatedSets>;
export async function getSet(db: D1Database, setNumber: string): Promise<SetRecord | null>;
```

Use D1 `.prepare(...).bind(...)`; never concatenate query input into SQL. Clamp no value silently: reject `page < 1`, `limit < 1`, and `limit > 100` with `400`.

- [ ] **Step 4: Implement routing, auth, and stable errors**

`worker/src/index.ts` must:

- leave `/health` public and return `{ ok: true }`;
- require `X-API-Key` for every `/sets` route;
- SHA-256 hash the supplied key with `crypto.subtle.digest`, compare its lowercase hex result with `WORKSHOP_API_KEY_SHA256`, and return `401` for missing/mismatched keys;
- return `400`, `401`, `404`, `429`, and `500` using one `jsonError(status, code, message)` helper;
- log only request path, status, and hashed-key prefix; never raw headers or keys.

- [ ] **Step 5: Add explicit query coverage**

Extend contract tests for `search`, `theme`, empty result, malformed key, unavailable D1 (`500`), and the `429` error payload. Ensure `search`/`theme` use bound `%value%` query parameters and pagination `total` reflects the same filters.

- [ ] **Step 6: Verify Worker contract**

Run:

```bash
npm run worker:test
npx wrangler dev --cwd worker --local
```

Expected: all contract tests pass; local `/health` responds `200`.

- [ ] **Step 7: Add guarded teardown**

Implement `worker/scripts/teardown.mts` to print:

```text
Worker to delete: bricklist-workshop
D1 database to delete: bricklist-workshop
```

Prompt exactly `Type DELETE_BRICKLIST_WORKSHOP to continue:`. On exact input only, run `npx wrangler delete --name bricklist-workshop`, then `npx wrangler d1 delete bricklist-workshop`; do not add `--skip-confirmation`, `--yes`, or `-y` to either command.

- [ ] **Step 8: Commit**

```bash
git add worker README.md
git commit -m "feat: add BrickList sets API"
```

### Task 4: Build the Expo Go Paginated Starter App

**Files:**
- Modify: `app/src/app/_layout.tsx`
- Modify: `app/src/app/index.tsx`
- Create: `app/src/types.ts`
- Create: `app/src/config.ts`
- Create: `app/src/api.ts`
- Create: `app/.env.example`
- Create: `app/src/__tests__/api.test.ts`
- Create: `app/src/__tests__/index.test.tsx`
- Modify: `app/package.json`

**Interfaces:**
- Consumes `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_WORKSHOP_API_KEY` from `app/.env.local`.
- `fetchSets(page: number, signal?: AbortSignal): Promise<PaginatedSets>` requests `/sets?page=${page}&limit=20` with `X-API-Key`.
- `PaginatedSets` matches Worker JSON: `{ items, page, limit, total }`.

- [ ] **Step 1: Write failing API client tests**

Mock `fetch` in `app/src/__tests__/api.test.ts` and assert:

```ts
expect(fetch).toHaveBeenCalledWith(
  "https://api.example.test/sets?page=2&limit=20",
  expect.objectContaining({ headers: { "X-API-Key": "workshop-key" } }),
);
```

Add failures for missing config and non-OK responses; client errors must include response status and API error message.

- [ ] **Step 2: Run API client tests to verify failure**

Run:

```bash
npm run test --workspace=@bricklist/app -- api.test.ts
```

Expected: FAIL because `fetchSets` does not exist.

- [ ] **Step 3: Implement config and fetch client**

`config.ts` reads the two public environment values and throws a clear setup error when either is absent. `api.ts` exports `fetchSets`, builds the URL using `new URL`, sets `X-API-Key`, parses the typed success payload, and throws a descriptive error for non-OK JSON responses.

- [ ] **Step 4: Write failing screen tests**

Mock `fetchSets` in `index.test.tsx`. Assert the screen:

- calls `fetchSets(1)` on mount;
- renders a basic loading message while pending;
- renders set number, name, theme, year, piece count, and image for every returned item;
- renders `Page 1`, a disabled Previous button, and an enabled Next button;
- calls `fetchSets(2)` after Next;
- renders a retryable error message after rejection;
- renders an empty message for `items: []`.

- [ ] **Step 5: Run screen tests to verify failure**

Run:

```bash
npm run test --workspace=@bricklist/app -- index.test.tsx
```

Expected: FAIL because the route does not exist.

- [ ] **Step 6: Implement the deliberately basic screen**

Use `ScrollView` and:

```tsx
{data.items.map((set) => (
  <View key={set.setNumber}>
    <Image source={{ uri: set.imageUrl }} />
    <Text>{set.setNumber}</Text>
    <Text>{set.name}</Text>
    <Text>{set.theme}</Text>
    <Text>{set.year}</Text>
    <Text>{set.pieceCount} pieces</Text>
  </View>
))}
```

Keep fetch state in this screen: `idle | loading | success | empty | error`. Do not introduce a list package, custom hook abstraction, detail screen, search UI, or artificial loading delay. Add Previous/Next controls and `Page {page}` text; disable Previous on page 1 and Next when `page * limit >= total`.

- [ ] **Step 7: Add attendee configuration template and startup documentation**

Create `app/.env.example`:

```dotenv
EXPO_PUBLIC_API_BASE_URL=https://replace-with-facilitator-worker-url
EXPO_PUBLIC_WORKSHOP_API_KEY=replace-with-shared-workshop-key
```

Document copying it to `.env.local`, with values supplied on slides and never committed.

- [ ] **Step 8: Verify Expo Go starter**

Run:

```bash
npm run test --workspace=@bricklist/app
npm run app:start
```

Expected: all tests pass; Expo serves a QR code for a physical phone.

- [ ] **Step 9: Commit**

```bash
git add app README.md
git commit -m "feat: add paginated BrickList Expo starter"
```

### Task 5: Add Frankie and Cross-Tool Routing

**Files:**
- Create: `FRANKIE.md`
- Create: `CLAUDE.md`
- Create: `AGENTS.md`
- Create: `.github/copilot-instructions.md`
- Create: `docs/frankie-macos-checklist.md`
- Test: manual host-routing checks documented in `docs/frankie-macos-checklist.md`

**Interfaces:**
- `FRANKIE.md` is the single source of truth for Frankie’s persona, checks, safety rules, and remediation protocol.
- Every adapter routes setup/readiness requests to `FRANKIE.md` without duplicating its instructions.

- [ ] **Step 1: Write acceptance checks before instructions**

Create `docs/frankie-macos-checklist.md` with explicit manual scenarios:

```text
1. macOS without Node: Frankie reports FAIL, explains why, offers neutral version-manager options, and waits for confirmation.
2. macOS with Expo Go-ready project: Frankie reports PASS and asks whether native diagnostics are wanted.
3. Missing Xcode: Frankie provides the official installation link and manual steps only.
4. Any credentials/signing/device-registration request: Frankie refuses to handle it and explains the attendee-owned next step.
5. Every supported host routes “run Frankie” to FRANKIE.md.
```

- [ ] **Step 2: Create the canonical Frankie behaviour**

Write `FRANKIE.md` with this fixed order:

```text
1. Introduce Frankie and explain inspect-before-change rule.
2. Confirm macOS; stop with a clear unsupported-platform result otherwise.
3. Run Expo Go readiness checks: architecture, Git, Node, package manager, dependencies, Expo tooling, disk, Expo Go phone installation, and same-network path.
4. Print PASS/WARNING/FAIL table: check, detected value, required condition, next action.
5. Ask whether optional iOS or Android native diagnostics are wanted.
6. Before every installation/system change, state command and effect; wait for explicit confirmation.
7. Re-check the repaired item and print remaining blockers.
```

It must detect existing Node/Ruby version managers, remain neutral if none exist, and state that it never handles credentials, signing, registration, destructive cleanup, or unattended GUI installs.

- [ ] **Step 3: Add thin host adapters**

Each adapter contains only routing language equivalent to:

```text
For React Native workshop readiness, use the Frankie agent instructions in FRANKIE.md. Read that file before assessing or changing the attendee environment. Follow its consent and safety boundaries exactly.
```

Do not copy diagnostics into adapters. Include GitHub Copilot CLI and VS Code Copilot Chat in `.github/copilot-instructions.md`.

- [ ] **Step 4: Run manual acceptance checks**

Use each available host against the repository, invoking setup/readiness and confirming it reads `FRANKIE.md`. Record host, date, version, result, and any routing limitation in `docs/frankie-macos-checklist.md`.

- [ ] **Step 5: Commit**

```bash
git add FRANKIE.md CLAUDE.md AGENTS.md .github/copilot-instructions.md docs/frankie-macos-checklist.md
git commit -m "feat: add Frankie setup companion"
```

### Task 6: Rehearse Facilitator Flow and Document Deployment

**Files:**
- Modify: `README.md`
- Create: `docs/facilitator-runbook.md`
- Create: `docs/api-contract.md`

**Interfaces:**
- Documents exact facilitator-only commands for D1 migration/import, Worker secret setup, deploy, verification, and guarded teardown.
- Documents exact attendee-only commands for local config and Expo Go startup.

- [ ] **Step 1: Write API contract documentation**

Define requests and example JSON for `/health`, `/sets?page=1&limit=20`, search, theme filtering, detail, and every stable error object. Include `X-API-Key` but never a real key.

- [ ] **Step 2: Write facilitator runbook**

Include this sequence, with named manual confirmation points:

```bash
npm install
npm run import:data --workspace=@bricklist/worker
npx wrangler d1 migrations apply bricklist-workshop --remote --cwd worker
npx wrangler d1 execute bricklist-workshop --remote --file=generated/seed-sets.sql --cwd worker
npx wrangler secret put WORKSHOP_API_KEY_SHA256 --cwd worker
npx wrangler deploy --cwd worker
```

Specify that the facilitator generates the random shared key locally, computes its SHA-256 hash for the Worker secret, and distributes the raw key outside Git.

- [ ] **Step 3: Document rehearsal checklist**

Require physical iOS and Android Expo Go requests over venue Wi-Fi, plus tunnel/cellular fallback, with observed setup and request timings. Include test cases for missing key, invalid key, empty list, unavailable Worker, and app retry.

- [ ] **Step 4: Verify documentation commands against local environment**

Run all non-deploying commands. Use `--local` where D1 state is needed. Do not authenticate, deploy, set secrets, or invoke teardown during automated verification.

- [ ] **Step 5: Commit**

```bash
git add README.md docs/facilitator-runbook.md docs/api-contract.md
git commit -m "docs: add BrickList facilitator runbook"
```

## Plan Self-Review

- Spec coverage: Tasks 1–3 implement the Worker/D1/API/import/teardown requirements; Task 4 implements the exact Expo Go starter; Task 5 implements Frankie and host routing; Task 6 provides rehearsal, deployment, and contract evidence.
- CSV boundary: Task 1 moves facilitator data into ignored `data/raw/`; no attendee task mentions downloading/importing it.
- Placeholder scan: no unresolved placeholders, deferred implementation, or undefined interfaces remain. `SetRecord`/`PaginatedSets` are defined in Tasks 3 and 4 before use.
- Constraint review: native-package freedom, no web/CORS, shared temporary key, no artificial latency, no detail route, and no unattended Frankie changes are represented in Global Constraints and task steps.
