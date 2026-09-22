# Task 4 Report: Expo Go Paginated Starter

## Status

DONE_WITH_CONCERNS

## Commits

- `feat: add paginated BrickList Expo starter`

## Files Changed

- `app/package.json`
- `app/tsconfig.json`
- `app/jest.setup.ts`
- `app/src/app/_layout.tsx`
- `app/src/app/index.tsx`
- `app/src/api.ts`
- `app/src/config.ts`
- `app/src/types.ts`
- `app/src/__tests__/api.test.ts`
- `app/src/__tests__/index.test.tsx`
- `package-lock.json`

Existing Task 4 configuration/documentation already matched requirements and was not changed:

- `app/.env.example`
- `README.md`

## Commands and Test Outputs

1. `npm run test --workspace=@bricklist/app -- api.test.ts --runInBand --no-watchman`
   - Initial red: failed because `@/api` did not exist.
   - Green: `Test Suites: 1 passed, 1 total`; `Tests: 3 passed, 3 total`.

2. `npm run test --workspace=@bricklist/app -- index.test.tsx --runInBand --no-watchman`
   - Initial red: existing template did not call `fetchSets` or render required list/pagination/error/empty UI.
   - Green: `Test Suites: 1 passed, 1 total`; `Tests: 5 passed, 5 total`.

3. `npm run test --workspace=@bricklist/app -- --runInBand --no-watchman`
   - `Test Suites: 2 passed, 2 total`; `Tests: 8 passed, 8 total`; `Snapshots: 0 total`.
   - Jest prints React `act(...)` environment warnings from the installed React Native test renderer despite passing assertions.

4. `npx tsc --noEmit`
   - Failed on pre-existing CSS module/side-effect CSS declarations in `src/components/animated-icon.web.tsx` and `src/constants/theme.ts`.
   - Before adding `types: ["jest"]`, test globals also failed; that Task 4 configuration issue was fixed.

5. `npm run lint --workspace=@bricklist/app`
   - Failed before linting: Expo CLI attempted automatic ESLint setup and then could not resolve `./utils/autoAddConfigPlugins.js` from its local CLI installation.
   - Automatic ESLint dependencies were removed from `app/package.json`; no lint configuration was added.

6. `npm run app:start`
   - Output: `Using src/app as the root directory for Expo Router.`, `Starting Metro Bundler`, and `Waiting on http://localhost:8081`.
   - Command was terminated by the 15-second non-interactive command timeout before QR output.

## Concerns

- Tests pass but emit React test-renderer `act(...)` environment warnings.
- Typecheck and lint remain blocked by pre-existing template/Expo CLI setup issues described above.
- Expo Metro started successfully, but the fixed command timeout prevented confirming the QR code.

## Fix Round 1: Lockfile Regeneration

- Added root npm overrides for `react` and `react-dom` at `19.2.3`, matching Expo SDK 57's declared React version and Jest Expo's renderer version.
- Regenerated `package-lock.json` after deleting stale lockfile and dependency directories. The regenerated lockfile contains Jest `29.7.0` and no ESLint package records.
- `npm ci --ignore-scripts` succeeded from the clean dependency state: `added 996 packages` and `audited 999 packages`.
- `npm run test --workspace=@bricklist/app -- --runInBand --no-watchman` passed: `Test Suites: 2 passed, 2 total`; `Tests: 8 passed, 8 total`.
- React `act(...)` warnings still print during screen tests but do not fail the suite.
