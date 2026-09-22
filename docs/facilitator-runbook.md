# BrickList Facilitator Runbook

Only the facilitator handles CSV inputs, Cloudflare authentication, D1 imports, secrets,
deployment, rehearsal, and teardown. Attendees only configure and start Expo Go.

## Preflight And Local Verification

Confirm `data/raw/sets.csv` and `data/raw/themes.csv` are present and contain the intended
workshop data. From the repository root, run these non-production checks:

```bash
npm install
npm run import:data --workspace=@bricklist/worker
npm run d1:import --workspace=@bricklist/worker
npm run worker:test
npm run test --workspace=@bricklist/app
```

**Manual confirmation: local seed.** Inspect the generated, ignored
`worker/generated/seed-sets.sql` and local D1 results before continuing. These commands use
local D1 state only; they do not authenticate, deploy, set a secret, or delete resources.

## Production Deployment

Complete each command manually from the repository root in an authenticated facilitator
session. Stop at every confirmation point; do not automate this sequence.

```bash
npm install
npm run import:data --workspace=@bricklist/worker
npx wrangler d1 migrations apply bricklist-workshop --remote
npx wrangler d1 execute bricklist-workshop --remote --file=generated/seed-sets.sql
npx wrangler secret put WORKSHOP_API_KEY_SHA256 --cwd worker
npx wrangler deploy --cwd worker
```

**Manual confirmation: migration.** Review the target name `bricklist-workshop` and the
pending migration before approving the remote D1 migration.

**Manual confirmation: import.** Confirm `worker/generated/seed-sets.sql` is generated from
the current local CSV files, then review Wrangler's remote database target before executing it.

**Manual confirmation: shared key.** Generate a random raw key locally. Compute its SHA-256
hash and enter only that hash when Wrangler prompts for `WORKSHOP_API_KEY_SHA256`. Keep the raw
key out of Git, shell history, screenshots, and logs; distribute it to attendees outside Git.

```bash
WORKSHOP_API_KEY="$(openssl rand -hex 32)"
printf %s "$WORKSHOP_API_KEY" | shasum -a 256 | awk '{print $1}'
```

**Manual confirmation: deploy.** Review the Worker name, account, route, and deployment URL
shown by Wrangler before confirming deployment. Record the deployed HTTPS URL for the slides.

## Deployment Verification

Use a disposable test key only through a local shell variable, replacing the placeholders with
the deployed URL and workshop key. Do not paste a real key into documentation, source control,
or chat.

```bash
curl -i "$BRICKLIST_API_URL/health"
curl -i -H "X-API-Key: $WORKSHOP_API_KEY" "$BRICKLIST_API_URL/sets?page=1&limit=20"
curl -i -H "X-API-Key: $WORKSHOP_API_KEY" "$BRICKLIST_API_URL/sets?search=gear"
curl -i -H "X-API-Key: $WORKSHOP_API_KEY" "$BRICKLIST_API_URL/sets?theme=Technic"
```

**Manual confirmation: API results.** Confirm `/health` returns `200` and `{ "ok": true }`,
the keyed list has the expected data, and filters work. Confirm an omitted key returns `401`.

## Physical-Device Rehearsal

Record actual observations; blank values mean the rehearsal is not complete. Do not infer
physical-device results from a simulator or local test run.

| Device | Network path | Expo Go setup time | First keyed request | Retry result | Observed by |
| --- | --- | --- | --- | --- | --- |
| Physical iOS | Venue Wi-Fi |  |  |  |  |
| Physical Android | Venue Wi-Fi |  |  |  |  |
| Physical iOS | Tunnel or cellular fallback |  |  |  |  |
| Physical Android | Tunnel or cellular fallback |  |  |  |  |

For both physical iOS and Android devices, first connect to venue Wi-Fi, copy the supplied URL
and key into `app/.env.local`, run `npm run app:start`, and open the QR code in Expo Go. If that
path fails, repeat via a facilitator-provided tunnel or cellular fallback. Time setup from
configuring `.env.local` until the app opens, and time the first keyed request from loading state
until results or error state.

Run and record these cases on the app:

1. Missing key: remove `EXPO_PUBLIC_WORKSHOP_API_KEY`; confirm the app reports its setup error.
2. Invalid key: use a known-invalid temporary value; confirm the API returns `401` and the app
   presents a retryable error.
3. Empty list: use a facilitator-controlled query or test dataset with zero results; confirm the
   app presents its empty state.
4. Unavailable Worker: temporarily use an unreachable test URL, not a teardown; confirm a
   retryable error.
5. App retry: restore a valid URL/key after an error and press Retry; confirm data loads.

## Attendee Startup

Attendees run only these commands from the repository root:

```bash
cp app/.env.example app/.env.local
npm install
npm run app:start
```

They set `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_WORKSHOP_API_KEY` in `app/.env.local` from
the workshop slides, connect their phone and Mac to the same venue Wi-Fi, and scan the Expo QR
code with Expo Go. Attendees do not download CSV files, import D1 data, authenticate with
Cloudflare, provision or deploy resources, set Worker secrets, or run teardown.

## Guarded Teardown

Use teardown only after the workshop and only as the facilitator. Review its printed targets,
then type the exact confirmation interactively:

```bash
npm run teardown
```

**Manual confirmation: deletion.** Verify both targets are `bricklist-workshop` and that all
workshop use has ended before typing `DELETE_BRICKLIST_WORKSHOP`. Never add a non-interactive
confirmation flag.
