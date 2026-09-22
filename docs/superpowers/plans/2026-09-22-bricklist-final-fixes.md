# BrickList Final Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the documented Worker `429` response reachable and remove Expo web support from the mobile-only workshop app.

**Architecture:** The Worker will keep a process-local, keyed fixed-window counter keyed only by the existing SHA-256 digest. The default policy permits 60 authorized API requests per 60-second window; optional environment bindings make the endpoint test deterministic without changing D1 access. The Expo app will retain only iOS/Android dependencies, configuration, routes, and generated-template artifacts.

**Tech Stack:** Cloudflare Workers, D1, Vitest, Expo SDK 57, React Native, Jest, npm workspaces.

## Global Constraints

- API remains read-only; retain parameterized D1 queries.
- Never log raw API keys; logs may include only an existing key hash prefix.
- Default limit: 60 authorized requests per 60-second fixed window.
- Test override: `RATE_LIMIT_MAX_REQUESTS=1`.
- Preserve iOS/Android Expo Go scripts and test setup.
- Remove Expo web config, dependencies, scripts, template route/files, and web-only assets.
- Regenerate `package-lock.json` when dependency declarations change; verify clean install.
- Commit one focused fix wave and write `.superpowers/sdd/2026-09-22-bricklist-workshop/final-fix-report.md`.

---

### Task 1: Reachable keyed Worker rate limit

**Files:**
- Modify: `worker/test/api.spec.ts:4,201-208`
- Modify: `worker/src/types.ts:1-4`
- Modify: `worker/src/index.ts:9-65`

**Interfaces:**
- Consumes: `Env.WORKSHOP_API_KEY_SHA256`, existing `jsonError`, `isAuthorized`, and D1 handlers.
- Produces: `Env.RATE_LIMIT_MAX_REQUESTS?: string`, `Env.RATE_LIMIT_WINDOW_SECONDS?: string`, plus a fixed-window check that returns `429 { error: { code: "rate_limited", message: "Too many requests" } }` before D1 reads.

- [ ] **Step 1: Write the failing endpoint-level test**

```ts
it('rate limits a keyed endpoint request with the standard error body', async () => {
  const rateLimitedEnv = { ...env, RATE_LIMIT_MAX_REQUESTS: '1' };
  const first = await worker.fetch(new Request('https://example.test/sets', keyed), rateLimitedEnv, {} as ExecutionContext);
  const second = await worker.fetch(new Request('https://example.test/sets', keyed), rateLimitedEnv, {} as ExecutionContext);

  expect(first.status).toBe(200);
  expect(second.status).toBe(429);
  await expect(second.json()).resolves.toEqual({
    error: { code: 'rate_limited', message: 'Too many requests' },
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace @bricklist/worker -- --runInBand`

Expected: FAIL because both endpoint requests return `200`; existing direct `jsonError(429, ...)` unit assertion does not exercise a rate-limit path.

- [ ] **Step 3: Write minimal implementation**

```ts
const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 60;
const DEFAULT_RATE_LIMIT_WINDOW_SECONDS = 60;
const rateLimitWindows = new Map<string, { startedAt: number; requests: number }>();

function isRateLimited(keyHash: string, env: Env, now = Date.now()): boolean {
  const maxRequests = Number(env.RATE_LIMIT_MAX_REQUESTS ?? DEFAULT_RATE_LIMIT_MAX_REQUESTS);
  const windowMs = Number(env.RATE_LIMIT_WINDOW_SECONDS ?? DEFAULT_RATE_LIMIT_WINDOW_SECONDS) * 1_000;
  const current = rateLimitWindows.get(keyHash);
  if (!current || now - current.startedAt >= windowMs) {
    rateLimitWindows.set(keyHash, { startedAt: now, requests: 1 });
    return false;
  }
  current.requests += 1;
  return current.requests > maxRequests;
}
```

Call `isRateLimited` only after successful authorization and before `listSets` or `getSet`; return `jsonError(429, "rate_limited", "Too many requests")` when true. Use the full SHA-256 digest as the map key; retain only its prefix in logging.

- [ ] **Step 4: Run Worker tests to verify they pass**

Run: `npm test --workspace @bricklist/worker`

Expected: PASS; new endpoint-level assertion returns the documented `429` JSON body and existing D1 tests remain green.

### Task 2: Remove Expo web support and generated template residue

**Files:**
- Modify: `app/app.json:2-40`
- Modify: `app/package.json:5-45`
- Modify: `package.json:5-8`
- Modify: `package-lock.json`
- Modify: `app/src/app/explore.tsx:1-180`
- Delete: `app/src/components/app-tabs.web.tsx`
- Delete: `app/src/components/web-badge.tsx`
- Delete: `app/src/components/animated-icon.web.tsx`
- Delete: `app/src/components/animated-icon.module.css`
- Delete: `app/src/hooks/use-color-scheme.web.ts`
- Delete: `app/src/global.css`
- Delete: `app/assets/images/tutorial-web.png`
- Delete: `app/assets/images/favicon.png`
- Delete: `app/assets/images/expo-badge.png`
- Delete: `app/assets/images/expo-badge-white.png`

**Interfaces:**
- Consumes: Expo Router entry point and existing iOS/Android `android`/`ios` scripts.
- Produces: no `web` Expo platform configuration/script/dependencies/template web code; unchanged mobile app test interfaces.

- [ ] **Step 1: Make configuration/dependency removal**

Remove the `expo.web` block, `react-dom`, `react-native-web`, the `web` script, and root `react-dom` override. Delete web-specific template files/assets. Remove web-only `Platform.select` styling, web-support copy, tutorial image, and `WebBadge` rendering from `explore.tsx`; preserve its iOS/Android presentation.

- [ ] **Step 2: Regenerate the lockfile**

Run: `npm install --package-lock-only`

Expected: root workspace lockfile removes direct web-only packages while retaining packages required transitively by Expo tooling.

- [ ] **Step 3: Run mobile app tests and static checks**

Run: `npm test --workspace @bricklist/app -- --runInBand && npm run lint --workspace @bricklist/app && npx tsc --noEmit -p app/tsconfig.json`

Expected: PASS; existing Expo Go/mobile test setup remains operational.

- [ ] **Step 4: Verify dependency installation from lockfile**

Run: `npm ci`

Expected: PASS because `package-lock.json` matches all workspace manifests.

### Task 3: Evidence and focused delivery

**Files:**
- Create: `.superpowers/sdd/2026-09-22-bricklist-workshop/final-fix-report.md`

**Interfaces:**
- Consumes: final Git status, test output, lockfile installation result, and commit SHA.
- Produces: traceable review closure report naming findings addressed, files changed, commands/results, commit, and remaining concerns.

- [ ] **Step 1: Write the report**

Include the rate-limit policy and test coverage; the removed web configuration/template/dependencies; exact test/lint/typecheck/clean-install commands and summarized output; final commit; and remaining concern that in-memory Worker counters are isolate-local and suitable only for this temporary workshop API.

- [ ] **Step 2: Inspect delivery diff**

Run: `git status --short && git diff --check && git diff --stat`

Expected: no whitespace errors; only final-fix files staged for the focused wave.

- [ ] **Step 3: Commit the focused fix wave**

```bash
git add worker/src/index.ts worker/src/types.ts worker/test/api.spec.ts app/app.json app/package.json app/src/app/explore.tsx package.json package-lock.json app/src/components/app-tabs.web.tsx app/src/components/web-badge.tsx app/src/components/animated-icon.web.tsx app/src/components/animated-icon.module.css app/src/hooks/use-color-scheme.web.ts app/src/global.css app/assets/images/tutorial-web.png app/assets/images/favicon.png app/assets/images/expo-badge.png app/assets/images/expo-badge-white.png .superpowers/sdd/2026-09-22-bricklist-workshop/final-fix-report.md docs/superpowers/plans/2026-09-22-bricklist-final-fixes.md
git commit -m "fix: close workshop API and mobile-only gaps"
```

- [ ] **Step 4: Record commit SHA in report and amend only if required by report ordering**

Write the resulting SHA to the report before the commit. If the report must contain the final commit SHA, amend this one focused commit after staging the final report update.
