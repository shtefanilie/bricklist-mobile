# BrickList Repository Guide

BrickList is a React Native workshop project for browsing LEGO sets. It is an npm workspace with an Expo mobile app, a Cloudflare Worker API, workshop exercises, and facilitator documentation.

## Repository Layout

- `app/`: Expo SDK 57 and React Native 0.86 application using Expo Router and strict TypeScript.
- `app/src/app/`: file-based routes and navigation layouts.
- `app/src/api.ts`: authenticated client for the workshop API.
- `app/src/__tests__/`: Jest and React Native Testing Library tests.
- `worker/`: Cloudflare Worker, D1 queries, migrations, import scripts, and Vitest tests.
- `docs/attendee-tasks/`: ordered workshop exercises completed by attendees.
- `docs/api-contract.md`: public API request, response, and error contract.
- `docs/facilitator-runbook.md`: deployment and workshop operations owned by facilitators.
- `FRANKIE.md`: consent-based attendee environment and simulator readiness workflow.

## Common Commands

Run commands from the repository root unless noted otherwise.

```bash
npm install
npm run app:start
npm run lint --workspace=@bricklist/app
npm run test --workspace=@bricklist/app
npx tsc --noEmit --project app/tsconfig.json
npm run worker:test
npm run worker:dev
```

CI uses Node 22, runs `npm ci`, app lint, app tests, and worker tests.

## Mobile App

- Follow `app/AGENTS.md` for Expo-specific rules. `app/CLAUDE.md` imports those instructions.
- Verify Expo and Expo Router behavior against SDK 57 documentation rather than memory.
- Use Expo Router for navigation. Route files belong in `app/src/app/`; reusable code belongs elsewhere under `app/src/`.
- Native tabs use `expo-router/unstable-native-tabs` on SDK 57. The stable `expo-router/native-tabs` import starts with SDK 58.
- Install app packages with `npx expo install <package>` from `app/` so Expo selects compatible versions.
- Do not create or edit generated `ios/` or `android/` directories. Configure native behavior through `app/app.json` and config plugins.
- Keep the app usable on both iOS and Android. Native-only behavior needs a clear cross-platform path.
- Run app lint and TypeScript checks after app changes. Run focused tests first, then the complete app suite.

## Worker API

- The Worker uses Cloudflare Workers, D1, Wrangler, TypeScript, and Vitest.
- Keep API behavior aligned with `docs/api-contract.md`.
- Every `/sets` request requires `X-API-Key`; `/health` is public.
- Use parameterized D1 queries. Do not interpolate request values into SQL.
- The API is read-only. Do not add mutations unless the workshop contract is intentionally changed.
- Run `npm run worker:test` after Worker, migration, import, or API-contract changes.
- Deployment, remote D1 operations, secrets, and teardown are facilitator-owned. Do not run them for attendees.

## Workshop Content

- Keep attendee tasks short, sequential, and achievable within their stated timeboxes.
- When renumbering or renaming a task, update its heading, filename references, the attendee task index, and cross-task references.
- Keep exercise instructions consistent with the branch state attendees will start from.
- Never place a real API key or other credential in examples, tests, prompts, logs, screenshots, or commits.

## Frankie

For React Native workshop readiness, environment setup, Android Studio, emulators, simulators, or attendee machine diagnostics, read and follow `FRANKIE.md` first. Frankie requires inspection before changes and explicit consent before installations, shell-profile edits, GUI launches, or other environment changes.

Frankie is for attendee readiness, not routine repository development. Normal code, test, API, and documentation work should follow the repository guidance above without forcing a readiness flow.

## Change Discipline

- Prefer small changes that preserve the workshop's intentional simplicity.
- Do not rewrite attendee configuration or unrelated worktree changes.
- Treat `app/.env.local` as sensitive even when Git shows it as modified. Never print or copy its values.
- Keep `package-lock.json` synchronized with dependency changes.
- Do not commit, push, deploy, or run destructive cleanup unless explicitly requested.
