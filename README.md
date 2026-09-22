# BrickList Workshop

BrickList is a facilitator-led React Native and Cloudflare Worker workshop.

## Facilitator path

1. Provide local source files in `data/raw/*.csv`.
2. Import the data into D1.
3. Set the Worker secret.
4. Deploy the Worker.
5. Distribute the deployed API URL and shared workshop key outside Git.

Raw CSV files, API keys, local secrets, and generated local state must not be committed.

## Attendee path

1. Copy `app/.env.example` to `app/.env.local`.
2. Set the public API URL and shared workshop key supplied on the workshop slides.
3. Run `npm install`.
4. Run `npm run app:start`.
5. Scan the Expo QR code with Expo Go.

Attendees do **not** download CSV files, run imports, provision Cloudflare, or run teardown.
