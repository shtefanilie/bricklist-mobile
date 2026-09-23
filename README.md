# BrickList 🧱

Welcome to BrickList: a tiny React Native app for exploring LEGO sets on your own phone.

By the end of the workshop, you will have changed the app, watched it hot-reload, and made a real API request. No prior React Native wizardry required — just bring a laptop, a phone, and a willingness to poke at things.

## Your mission

Get BrickList running in Expo Go. Once it is open on your phone, you are ready to build.

## Before you start

You need:

- A Mac with Node.js and npm installed
- Your own iPhone or Android phone
- [Expo Go](https://expo.dev/go) installed on that phone
- Your laptop and phone on the same Wi-Fi
- The API URL and temporary key from the slides

> For anything else, ask `Frankie` for help

### Frankie

Not sure whether your laptop is ready? Ask [Frankie the fixer](FRANKIE.md) to help you out. Throughout this journey, Frankie will be your go to companion.

Don't have the Ruby version you need? Frankie'll fix it!

Your machine has a java version missmatch? Frankie'll fix it!

Simulators are not booting up your app? Frankie'll fix it!

You are sleepy after all that delicious lunch you had? Well, Frankie can't fix that. 

## Get it running

### 1. Add your workshop details

Open `app/.env.local` and replace both placeholder values with the URL and temporary workshop key from the slides:

```dotenv
EXPO_PUBLIC_API_BASE_URL=https://bricklist-workshop.stefanionut92.workers.dev
EXPO_PUBLIC_WORKSHOP_API_KEY=your-temporary-workshop-key
```

> This file is committed with placeholders so everyone starts from the same place. Do not commit a real workshop key, or include one in a pull request.

### 2. Install the project bits

```bash
npm install
```

### 3. Start BrickList

```bash
npm run app:start
```

Expo will show a QR code in your terminal or browser. 

### 4. Open it on your phone

- **iPhone:** open the Camera app and scan the QR code, then choose Expo Go.
- **Android:** open Expo Go and use **Scan QR code**.

Give it a moment. You should see BrickList and a page of LEGO sets. That is you over the line, my son.

## You are ready when…

- BrickList opens in Expo Go on your phone
- You can see a list of sets
- Changing text in the app makes your phone update after you save

If all three happen, you are flying. Start the exercise.

## Start the workshop

Work through the [attendee tasks](docs/attendee-tasks/README.md) in order. Each task has its own file, timebox, goal, and finish line.

## If it is being a little menace (troubleshooting)

| Problem | Try this |
| --- | --- |
| QR code will not open | Confirm Expo Go is installed, then scan it again from the app or phone camera. |
| Phone cannot reach the app | Check laptop and phone are on the same workshop Wi-Fi. Ask a helper for the tunnel or cellular fallback if the venue network is being muggy. |
| App says configuration is missing | Check `app/.env.local` exists and that both `EXPO_PUBLIC_...` values came from the workshop slides. Restart `npm run app:start` after editing it. |
| App shows an API error | Check the URL and temporary key character-for-character. If they look right, show a helper the error — do not put the key in public chat. |
| `npm install` or Expo refuses to cooperate | Grab a helper and use [Frankie](FRANKIE.md). We inspect first; no random command roulette. |

## Workshop ground rules

- Break the app. That is how you learn.
- Ask daft questions early. They are normally the useful ones.
- Keep API keys out of Git, chat, screenshots.

## Leave these alone

Attendees do **not** need to authenticate with Cloudflare, deploy anything, configure Worker secrets, or run teardown. That is facilitator territory. Do not waste your workshop fighting infrastructure, you wally.

## Facilitators

Deployment, data import, rehearsal, and teardown instructions live in the [facilitator runbook](docs/facilitator-runbook.md). The API shape is documented in the [API contract](docs/api-contract.md).
