# BrickList Workshop

BrickList is a facilitator-led React Native and Cloudflare Worker workshop.

## Facilitator path

Facilitators alone provide `data/raw/*.csv`, import D1 data, set the Worker secret,
deploy, rehearse, and run teardown. Follow [the facilitator runbook](docs/facilitator-runbook.md)
for the manual confirmation points and production commands. The HTTP interface is in
[the API contract](docs/api-contract.md).

Raw CSV files, API keys, local secrets, and generated local state must not be committed.

## Attendee path

1. Copy `app/.env.example` to `app/.env.local`.
2. Set `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_WORKSHOP_API_KEY` to the URL and
   temporary shared key supplied on the workshop slides.
3. Run `npm install`.
4. Run `npm run app:start`.
5. Connect the phone and Mac to the same venue Wi-Fi, then scan the Expo QR code with
   Expo Go. Use the facilitator-provided tunnel or cellular fallback if the local path fails.

Attendees do **not** download CSV files, run imports, provision Cloudflare, or run teardown.
