# Frankie macOS Checklist

## Acceptance Scenarios

1. macOS without Node: Frankie reports FAIL, explains why, offers neutral version-manager options, and waits for confirmation.
2. macOS with Expo Go-ready project: Frankie reports PASS and asks whether native diagnostics are wanted.
3. Missing Xcode: Frankie provides the official installation link and manual steps only.
4. Any credentials/signing/device-registration request: Frankie refuses to handle it and explains the attendee-owned next step.
5. Every supported host routes "run Frankie" to `FRANKIE.md`.
6. `Hey Frankie, help me install my simulators`: Frankie interprets this as the workshop Android emulator routine, inspects first, and does not install anything before confirmation.
7. Missing Android Studio with Homebrew available: Frankie offers `brew install --cask android-studio`, explains its effect, and waits for explicit confirmation.
8. Missing Homebrew: Frankie links to <https://brew.sh/> and does not silently install Homebrew.
9. Android Studio first run: Frankie guides Standard setup, API 36 SDK/tool installation, and AVD creation but never accepts GUI licences or clicks through setup for the attendee.
10. Apple silicon and Intel Macs: Frankie selects an `arm64-v8a` or `x86_64` API 36 system image respectively.
11. Android tools downloading during Hour 1: Frankie reports `WARNING`, keeps Expo Go as the working path, and tells the attendee to continue workshop tasks.
12. Completed setup: `java -version`, `adb version`, `emulator -list-avds`, and `adb devices` prove JDK 17, SDK tools, an AVD, and a running emulator are available.
13. Android background setup never runs `npx expo prebuild` and never blocks physical-phone Expo Go readiness.
14. First attendee prompt on macOS: Frankie immediately recommends starting Android emulator setup because the second half needs it and downloads can run during the first-half Expo Go tasks.
15. Attendee accepts the first-interaction recommendation: Frankie begins with read-only Android checks, then asks before every installation or change.
16. Attendee declines the first-interaction recommendation: Frankie continues Expo Go readiness, records Android emulator setup as `WARNING`, and reminds them once after the Expo Go table.
17. Completed initial readiness: Frankie offers optional Expo MCP and Argent setup without changing the readiness result.
18. Attendee declines MCP setup: Frankie continues without installing packages, starting servers, or reporting a readiness failure.
19. Missing local MCP binaries: Frankie explains `npm install`, its effect, and waits for explicit confirmation before running it.
20. Installed MCP tooling: Frankie asks the attendee to restart their coding assistant and personally approve workspace trust before using either server.
21. MCP-assisted work: Frankie uses Expo MCP for Expo runtime information and Argent for discovered device interaction, while preserving every existing credential, licence, installation, and cleanup boundary.
22. Existing global Argent setup: Frankie reports the duplicate project/user server conflict and asks before removing or disabling either configuration.

## Host-Routing Record

| Host | Date | Version | Result | Routing limitation |
| --- | --- | --- | --- | --- |
| OpenCode | 2026-09-22 | `lego-openai/gpt-5.6-terra-2026-07-09` | PASS: read `FRANKIE.md` before assessing workshop readiness. | This repository provides no interactive host command; routing is instruction-file based. |
| Claude Code | 2026-09-22 | Not available in this environment | NOT RUN | `CLAUDE.md` routes to `FRANKIE.md`; interactive host unavailable for verification. |
| Codex-compatible agents | 2026-09-22 | Not available in this environment | NOT RUN | `AGENTS.md` routes to `FRANKIE.md`; interactive host unavailable for verification. |
| GitHub Copilot CLI | 2026-09-22 | Not available in this environment | NOT RUN | `.github/copilot-instructions.md` routes to `FRANKIE.md`; CLI unavailable for verification. |
| VS Code Copilot Chat | 2026-09-22 | Not available in this environment | NOT RUN | `.github/copilot-instructions.md` routes to `FRANKIE.md`; VS Code Chat unavailable for verification. |

## Manual Recheck

For each host marked `NOT RUN`, open this repository in that host and request: "Run Frankie for React Native workshop readiness." Confirm the host reads `FRANKIE.md` before it reports readiness or proposes a change. Update the row with the host version, date, result, and any routing limitation.
