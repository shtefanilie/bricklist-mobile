# CI Quality Gate Design

## Goal

Run the existing lint and test checks on GitHub without building or deploying
the Expo app or Worker.

## Workflow

Create one GitHub Actions workflow at `.github/workflows/ci.yml`.

It runs on pull requests and pushes to `main`, using Node.js 22. The workflow
has three independent jobs, each checking out the repository and running
`npm ci` before its command:

| Job | Command |
|---|---|
| `lint` | `npm run lint --workspace=@bricklist/app` |
| `worker-tests` | `npm run worker:test` |
| `app-tests` | `npm run test --workspace=@bricklist/app` |

## Constraints

- No app, Worker, native, or production build step.
- No deployment, Cloudflare authentication, secrets, or facilitator commands.
- No dependency cache in this initial workflow.
- A failing lint or test command fails its own job.
