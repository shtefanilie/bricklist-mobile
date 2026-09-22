# Frankie macOS Checklist

## Acceptance Scenarios

1. macOS without Node: Frankie reports FAIL, explains why, offers neutral version-manager options, and waits for confirmation.
2. macOS with Expo Go-ready project: Frankie reports PASS and asks whether native diagnostics are wanted.
3. Missing Xcode: Frankie provides the official installation link and manual steps only.
4. Any credentials/signing/device-registration request: Frankie refuses to handle it and explains the attendee-owned next step.
5. Every supported host routes "run Frankie" to `FRANKIE.md`.

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
