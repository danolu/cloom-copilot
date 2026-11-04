# Cloom Copilot — Voice & Chat AI for Hotel Operations

![Cloom Copilot](public/logo.png)

> Run the whole property by voice or chat. Powered by Meta Muse Spark, Muse Voice Transcribe, and Muse Wonder.

Hotel teams run day-to-day operations through spoken voice notes, live hands-free calls, and conversational chat: morning digests, guest folios & billing, room turnovers, housekeeping tasks, rate adjustments, and staff approvals. Built for the **[Meta AI Developer Hackathon](https://cerebralvalley.ai/e/meta-ai-developer-hackathon/details)** (Startup track).

Built with **[Muse Code](https://dev.meta.ai/lp/muse-code)** and powered exclusively by **Meta models** via the **[Meta Model API](https://dev.meta.ai/products/meta-model-api)**:

| Model                                                                         | Meta Family                                  | Role in Cloom Copilot                                                                     |
| ----------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **[Muse Spark Series](https://dev.meta.ai/models/muse-spark)**                | Meta Model API (`muse-spark-1.3`)            | Operations reasoning, tool calling, multi-step role permission gates & confirmation flows |
| **[Muse Spark Open](https://dev.meta.ai/models/muse-spark-open)**             | Meta Open Weights                            | Self-hosted on-premise agent variant for privacy-sensitive luxury properties              |
| **[Muse Voice Transcribe](https://dev.meta.ai/models/muse-voice-transcribe)** | Meta Model API (`muse-voice-transcribe-1.0`) | Instant voice note transcription from hotel staff microphones                             |
| **[Muse Wonder](https://dev.meta.ai/models/muse-wonder)**                     | Meta Model API (`muse-wonder-1.0`)           | Analytical reasoning & executive insight synthesis for GM morning digests                 |

---

## Quickstart (Judges & Evaluation)

```bash
cp .env.example .env   # then set MODEL_API_KEY (required — no offline mode)
pnpm install
pnpm test              # unit tests verifying role gates, folios, undo & safety (Spark stubbed)
pnpm dev               # Next.js dev server — open the URL it prints
```

- **With `MODEL_API_KEY` or `META_API_KEY` set**: Live inference runs through Meta Model API.
- **Without a key**: The API returns a clear configuration error. Every decision runs through Muse Spark via the Meta Model API — there is deliberately no offline/regex fallback, and a failed live call surfaces an error instead of downgrading.
- **Demo state & persistence**: There is deliberately no backend/database. Each browser gets its own in-memory hotel session (`x-session-id`, stored in `localStorage`), so judges don't mutate each other's demo; chat history and selected role also persist in `localStorage`. State survives role switches and page refreshes, but **resets on server restart/redeploy**. Admins get a **♻️ Reset demo** button (also `POST /api/reset`, ADMIN/SUPER_ADMIN only) to restore the seeded property for the next judge.

---

## Live Features Judges Can Test in the UI

Switch roles in the top header — all 9 roles are represented (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `SUPERVISOR`, `FRONT_DESK`, `HOUSEKEEPING`, `ACCOUNTANT`, `CASHIER`, `RESTAURANT_MANAGER`) — and tap the chips or speak:

- **Hands-Free Live Voice Call**:
  - Tap **Call Copilot** in the header for a real-time, hands-free phone conversation with the AI copilot.
- **Muse Voice Transcribe (Spoken Operations)**:
  - Hold the **Mic** button to speak a command (e.g. _"Cleaned room 204"_ or _"Add $25 minibar charge to room 101"_).
- **Muse Wonder Executive Briefing**:
  - Switch to **Dan (Admin)** and tap `☀️ Morning digest (Muse Wonder)`.
  - Delivers an analytical synthesis of revenue trends, room turnovers, and pending sign-offs.
- **Guest Folios & Billing**:
  - `show folio for room 101` · `add $25 minibar charge to room 101` (confirm · undo) · `settle folio for room 101 with credit card`
- **Front Desk & Turnovers**:
  - `cleaned room 204` (marks room clean)
  - `check in Amara Osei to 102`
  - `check out room 101` (automatically marks room dirty and generates turnover task for Housekeeping)
- **Revenue & Rate Yields**:
  - `revenue report this week` (generates downloadable CSV document)
  - `raise Deluxe rates by 10%` (displays per-room price preview before confirmation)
- **Role Security**:
  - Switch role to **Kofi (Housekeeping)** and ask to `raise Deluxe rates by 10%` → intercepted and blocked by the role gate (`⛔ HOUSEKEEPING cannot do that`).

---

## Architecture

```
Web Browser (Next.js 16 / React 19)
  ├─ Hands-Free Live Voice Call (Continuous ASR + TTS)
  ├─ Browser Mic Voice Notes (MediaRecorder)
  ├─ Role Switcher (Admin, Manager, Housekeeping, Front Desk, Cashier)
  └─ Conversational Copilot Chat UI
            │
            ▼
Next.js Server API Routes (/api/chat, /api/voice, /api/digest)
            │
            ├──▶ Agent Brain (Muse Spark tool-calling / Muse Spark Open)
            ├──▶ Voice Transcription (Muse Voice Transcribe)
            ├──▶ Executive Insights (Muse Wonder)
            ├──▶ Safety Gates (Role-checked + Confirm-gated)
            └──▶ PropertyBackend (Folios, Rooms, Rates, Tasks, Audit)
```

## Code Organization

```
src/
  app/          Next.js routes (thin: parse request → call a service → respond) + page composition
  components/   Copilot UI (header, role switcher, message list, chips, input, live-call overlay)
  hooks/        useCopilotChat, useVoiceNote, useLiveCall, useTextToSpeech
  lib/          Browser-side API client (api.ts) and speech helpers — no server imports
  server/
    agent/      Conversation engine: role gates, confirm-before-write, result formatting
    ai/         Meta Model API client (Spark/Wonder), voice transcription/audio
    hotel/      PropertyBackend: seed state, permissions, users, schemas, tools by domain
                (dashboard, folios, rooms, tasks, revenue, admin) composed by createHotel()
  shared/types/ Domain types shared across the client/server boundary
tests/          Mirrors src: agent/ (role gates, folios, undo), frontdesk/ (agentic flows), session/ (isolation, reset, revenue),
                helpers/ (Muse Spark test double — canned JSON decisions, tests only)
```

Client code (`components`, `hooks`, `lib`) never imports `src/server` — enforced by an
ESLint `no-restricted-imports` rule — so browser bundles stay free of `node:fs`,
`node:child_process`, and the Meta API key.

---

## Safety Model

- **Role-gated:** Every tool declares its allowed roles (`PERMISSIONS` in `src/server/hotel/permissions.ts`): ADMIN/SUPER_ADMIN manage team and settings, MANAGER handles rates and operations, HOUSEKEEPING sees tasks and room status only.
- **Confirm-before-write:** High-impact writes and rate changes are confirm-gated before execution.
- **Preview & Undo:** Bulk writes show a per-item preview before confirmation, and writes are undoable (`undo` reverts rates, room blocks, tasks, folio charges, and team updates).
- **Audit Log:** Every executed tool call lands in an immutable audit log.
