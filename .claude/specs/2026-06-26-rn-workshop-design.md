# React Native Workshop — BrickList

**Duration:** 2 hours
**Audience:** Developers new to React Native
**Platforms:** macOS attendee laptops; Expo Go on physical iOS and Android phones

## Outcome

Attendees run a small Expo app on their phones, observe a deliberately basic
networked list, and progressively improve it using a list package and native
patterns. They understand the boundary between Expo Go and packages that need
`npx expo prebuild`, but native-package experiments are self-directed and
supported by workshop slides rather than a prescribed package or prebuilt
development client.

Opening a pull request is optional follow-up work, not a workshop outcome.

## Repository Layout

This repository contains both products:

```text
app/       Expo Router BrickList application
worker/    Cloudflare Worker, D1 schema, importer, and deployment tooling
```

The Worker and D1 database are both named `bricklist-workshop`.

## Workshop Flow

| Time | Activity |
|---|---|
| 0:00–0:10 | Frankie triage and Expo Go setup |
| 0:10–0:25 | Route/component/hot-reload demonstration |
| 0:25–0:55 | Fetch, render, and paginate LEGO sets |
| 0:55–1:00 | Explain Expo Go versus prebuild/native packages |
| 1:00–1:05 | Break |
| 1:05–1:45 | Improve the list; attendees choose native/package experiments with slides |
| 1:45–1:55 | Share/debug common outcomes |
| 1:55–2:00 | Close and follow-up paths |

Venue Wi-Fi is the normal path for Metro and Worker access. Expo tunnel or
cellular connectivity is the fallback when local-network discovery fails.

## BrickList App

The default branch remains Expo Go-compatible and contains no arbitrary custom
native modules.

### Initial Screen

On launch, the app fetches the first 20 sets from:

```text
GET /sets?page=1&limit=20
```

It renders the result using an intentionally basic JavaScript `.map()` over a
scroll view. Each row shows:

- set number
- name
- theme
- year
- piece count
- image

The bottom of the screen has only `Previous` and `Next` buttons plus current
page text. There is no detail route in v1.

No artificial server delay is added. Real network latency is part of the
lesson. The starter's deliberately basic rendering gives attendees a visible
reason to install and evaluate a list package, then improve pagination,
loading, and the native experience in small steps.

### Configuration

Slides instruct attendees to create a gitignored `.env.local` containing the
Worker base URL and shared workshop key. The app sends the key in `X-API-Key`.
Expo `EXPO_PUBLIC_*` values are client-visible; the shared key is a temporary
workshop gate, not a production secret.

The app is mobile-only. It does not support Expo web, so the Worker does not
enable CORS.

## Workshop Sets API

The public Cloudflare Worker is backed by Cloudflare D1 and has no mutation
endpoints.

```text
GET /health
GET /sets?page=<number>&limit=<number>
GET /sets?search=<text>
GET /sets?theme=<theme>
GET /sets/:setNumber
```

`/health` may be public. All `/sets` endpoints require `X-API-Key`, use
parameterised D1 queries, enforce a fixed maximum page size, and return stable
JSON errors for `400`, `401`, `404`, `429`, and `500`.

The Worker logs request outcome without raw keys or full sensitive headers.

### Data

Data comes from Rebrickable's downloadable CSV bundle for this non-commercial
workshop. The Worker serves set metadata and Rebrickable image URLs; it does
not host copied image assets.

Before the workshop, the facilitator manually downloads and extracts the bundle.
The ignored `data/raw/` directory contains:

```text
data/raw/sets.csv
data/raw/themes.csv
```

The repository supplies a repeatable importer and D1 migration for facilitator
use. Raw input is never committed. Attendees only consume the already deployed
API. The D1 schema keeps only exercise fields: set identifier, name, resolved
theme name, year, piece count, and image URL, with indexes for identifier,
theme, and search.

### Shared Key and Teardown

One shared attendee key is distributed outside source control. It is acceptable
for the temporary workshop but can be copied by attendees and must never be
described as secure production authentication.

The repository provides a guarded teardown command that prints its Worker and
D1 targets and requires explicit confirmation. It must use Wrangler's normal
interactive deletion behaviour, not automatic `--skip-confirmation` flags.
The facilitator runs teardown after the workshop.

Production deployment is performed by the workshop lead using their own
authenticated Wrangler session. Local Worker/D1 development remains available
without Cloudflare credentials.

## Frankie: Attendee Setup Companion

Frankie is a conversational repository agent, not a standalone command-line
checker. It is an attendee's setup companion: inspect first, explain results,
ask before changes, then guide or run approved safe remediation using the host
agent's available tools.

### Cross-Tool Integration

`FRANKIE.md` is the canonical personality, diagnostic sequence, safety policy,
and repair flow. Thin routing adapters point to it from:

- `CLAUDE.md` for Claude Code
- `AGENTS.md` for OpenCode and compatible agents
- GitHub Copilot CLI instructions
- VS Code Copilot Chat instructions

The adapters must not duplicate diagnostic logic. All hosts receive the same
Frankie behaviour while using their own terminal and interaction surfaces.

### Behaviour

- Supports macOS only in v1.
- Starts with Expo Go readiness: macOS architecture, Git, Node.js, project
  package manager/dependencies, Expo tooling, disk space, Expo Go on phone,
  and phone/Mac network connectivity.
- Offers optional Android-native and iOS-native diagnostics after Expo Go is
  ready.
- Reports every check as pass, warning, or fail, with detected and required
  values plus the next action.
- Detects existing Node and Ruby version managers. It stays neutral when none
  exists, presenting appropriate options instead of imposing a manager.
- Requests explicit attendee confirmation before every install or system
  change. Once confirmed, it may run safe commands when the host permits.
- For Xcode and Android Studio, provides official installation links and manual
  steps only; it never attempts unattended GUI installation.
- Re-runs relevant checks after remediation and states remaining blockers.
- Never handles Apple/Google credentials, signing certificates, device
  registration, account enrolment, or destructive cleanup.

## Verification Gates

- Clean clone, dependencies, `npx expo start`, QR scan, and keyed request work
  on physical iOS and Android phones.
- Worker contract tests cover all endpoints and expected authentication,
  invalid-query, absent-set, empty-result, and unavailable-D1 failures.
- Local importer validates row count and representative records before remote
  D1 import.
- Frankie accurately classifies intentionally incomplete macOS environments
  and never changes a machine without attendee confirmation.
- A timed rehearsal completes within two hours using venue Wi-Fi, with tunnel
  or cellular fallback tested.

## Out of Scope

- Expo web support
- Worker mutation endpoints
- Per-attendee keys
- Artificial response latency
- A mandated native package, prebuilt development client, or guaranteed native
  package support
- Automated credential, signing, registration, or destructive system actions
