# BrickList workshop final-fix report

## Findings addressed

1. **Reachable rate limiting:** Added a keyed, in-memory fixed-window limiter for authorized `/sets` requests. It allows 60 requests per 60 seconds by default. Optional `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_SECONDS` bindings provide deterministic workshop/test configuration. State uses only the SHA-256 digest; request logs retain only its existing eight-character prefix. The endpoint-level test overrides the maximum to `1`, verifies the first keyed request succeeds, and asserts the second returns the documented `429` body.
2. **Mobile-only Expo delivery:** Declared only `ios` and `android` platforms. Removed the Expo web configuration, web script, direct web dependencies, root React DOM override, starter web route/code/assets, and web-oriented template documentation. iOS/Android Expo Go scripts and Jest setup remain.

## Files changed

- Worker: `worker/src/index.ts`, `worker/src/types.ts`, `worker/test/api.spec.ts`
- Mobile config/dependencies: `app/app.json`, `app/package.json`, `package.json`, `package-lock.json`
- Mobile template cleanup: `app/README.md`, `app/src/constants/theme.ts`, removed `app/src/app/explore.tsx`, web-only components/hooks/styles, external-link template component, and web-only assets
- Process record: `docs/superpowers/plans/2026-09-22-bricklist-final-fixes.md`
- This report

## Verification

| Command | Result |
| --- | --- |
| `npm test --workspace @bricklist/worker` | PASS — 3 files, 24 tests. Endpoint test logged `status=429 key_hash_prefix=d98b4b7a`; no raw key logged. |
| `npm test --workspace @bricklist/app -- --runInBand` | PASS — 2 suites, 8 tests. Existing React `act(...)` console warnings remain. |
| `npm ci` | PASS — installed 995 packages from regenerated lockfile. |
| `npm run lint --workspace @bricklist/app` | Not completed: Expo tried to auto-install unconfigured ESLint packages and timed out; those unintended manifest changes were reverted. |
| `npx tsc --noEmit -p app/tsconfig.json` | Existing failure: `app/src/__tests__/api.test.ts(8,5): Cannot find name 'global'`. This is outside the final-fix scope and does not affect Jest execution. |

## Commit

`fix: close workshop API and mobile-only gaps` (single focused commit; final SHA reported with delivery)

## Remaining concerns

- In-memory limiter state is isolate-local and resets on Worker restarts; appropriate for temporary workshop traffic, not distributed production enforcement.
- `npm ci` reports 22 dependency-audit vulnerabilities (16 moderate, 6 high) in the existing dependency graph.
- App Jest passes with existing React `act(...)` console warnings; app typecheck needs the pre-existing `global` typing issue resolved before it can pass.
