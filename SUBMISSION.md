# Hackathon Submission — Copy for the Portal

Paste these into https://cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/submit
before Nov 4, 9:00 PM ET. Replace every TODO before submitting.

## Fields

- Project name: Cloom Copilot — Voice & Chat for Property Operations
- Track: Startup
- Theme: Build for Your World
- Repository: https://github.com/danolu/cloom-copilot
- Live demo: TODO — add deployed URL, or write: Run locally, see README Quickstart (requires a Meta Model API key)
- Demo video: TODO — add video URL
- Team members: TODO — list every member; the person submitting is the team Representative

## Short description

Hotel teams run the property by voice and chat. Cloom Copilot lets staff
check rooms, clean and turn over rooms, manage guest folios and billing,
adjust rates, and get a morning executive digest — by speaking or typing
in plain language, with role permissions and confirm-before-write safety
on every action.

## Long description

Cloom Copilot is a property operations copilot for hotels, built for the Meta
AI Developer Hackathon (Startup track, Build for Your World).

Staff open a live property dashboard (rooms, occupancy, revenue, tasks)
and talk to the copilot in a chat popover, by voice note, or in a
hands-free live call. Muse Spark reasons over the request and calls
hotel tools — room status, turnovers, guest folios, charges, rate
changes, reservations, and staff tasks. Muse Voice Transcribe turns
voice notes into commands. Muse Wonder writes the general manager's
morning digest from live property data.

Safety is built in: nine staff roles each see only what their job
allows, high-impact writes show a preview and need confirmation before
anything changes, bulk writes can be undone, and every action is written
to an audit log.

## Meta models used

- Muse Spark (`muse-spark-1.3`, Meta Model API) — agent reasoning, tool calling, role gates, confirmation flows
- Muse Voice Transcribe (`muse-voice-transcribe-1.0`, Meta Model API) — voice note transcription
- Muse Wonder (`muse-wonder-1.0`, Meta Model API) — morning digest and executive insight
- Built with Muse Code

## Describe your use of Meta products to build the submitted project

Cloom Copilot was built with Muse Code and is powered exclusively by Meta
models through the Meta Model API — no other AI provider, and deliberately
no offline or rule-based fallback. If the Meta Model API is not configured,
the copilot returns a clear configuration error rather than guessing.

Muse Spark (`muse-spark-1.3`) is the operations brain. For every typed or
transcribed request, Spark receives the available hotel tool schemas and
recent conversation history and returns a structured JSON decision: a
single tool call, an ordered `actions` array for compound requests, or a
plain reply. That drives room status and turnovers, check-in/check-out,
guest folios and charges, rate changes, reservations, staff tasks, revenue
reports, and role briefings. The server — never the model alone — then
enforces nine-role permissions, previews write actions, and requires
confirmation before anything changes, with preview, undo, and an immutable
audit log.

Muse Voice Transcribe (`muse-voice-transcribe-1.0`) is the ears. Voice
notes recorded in the browser are converted to the WAV format Meta's
`/asr/transcribe` endpoint requires and transcribed server-side; the
resulting text enters the same Spark agent pipeline as typed chat, so
"cleaned room 204" or "add a $25 minibar charge to room 101" spoken by
hands-busy staff becomes a safe, confirmable action.

Muse Wonder (`muse-wonder-1.0`) is the executive voice. The morning
digest endpoint feeds Wonder live dashboard data (occupancy, arrivals,
revenue, open tasks, pending approvals) and it returns one prioritised
insight sentence for the general manager, combined with a deterministic,
data-backed nudge computed from property state. All model IDs and the API
base URL are environment-configurable, so models can be swapped without
code changes.

## Why are Meta's models important to your solution?

Without Meta's models, Cloom Copilot does not degrade — it stops. Every
decision runs through Muse Spark, every uploaded voice note through Muse
Voice Transcribe, and every digest insight through Muse Wonder. That is
intentional: hotel staff will only trust a copilot that understands real,
messy requests ("do the same for 205", "check out 101 and raise Deluxe
rates 10%") over one that matches keywords.

Spark matters because of its structured, multi-step reasoning. It maps
natural language onto typed tool calls, resolves follow-ups from
conversation history, and decomposes compound requests into one ordered
plan that our server can validate, permission-check, preview, and put
behind a single confirmation. That combination — a model powerful enough
to propose, and a deterministic safety layer that disposes — is what
makes an AI agent safe to let near billing, rates, and reservations.

Voice Transcribe matters because voice is the primary interface in a
hotel, not a novelty: housekeeping and front-desk staff work with their
hands full, away from desks. Accurate transcription is what lets them
run the property by speaking. Wonder matters because managers do not
need more dashboards of raw numbers; they need synthesis — the one thing
to act on this morning, in one sentence, grounded in live data.

Finally, having specialised models for reasoning, transcription, and
analysis behind one Meta Model API (one key, one base URL) let a small
startup team ship a voice-first, multi-role operations agent in
hackathon time, choosing the right Meta model for each job instead of
forcing one model to do everything.

## How judges can test it

1. `cp .env.example .env` and set `MODEL_API_KEY`
2. `pnpm install && pnpm test && pnpm dev`
3. Switch roles in the header. As Dan (Admin), ask for the morning digest.
4. As Kofi (Housekeeping), try `raise Deluxe rates by 10%` — it is blocked.
5. Ask `add $25 minibar charge to room 101`, confirm, then say `undo`.

## Checklist before submitting

- [ ] Demo video recorded and link added above
- [ ] Live demo deployed and link added above (or local-run note kept)
- [ ] All team members listed
- [ ] Track confirmed as Startup
