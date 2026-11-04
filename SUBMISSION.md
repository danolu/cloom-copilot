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

## How judges can test it

1. `cp .env.example .env` and set `MODEL_API_KEY`
2. `pnpm install && pnpm test && pnpm dev`
3. Switch roles in the header. As Dan (Owner), ask for the morning digest.
4. As Kofi (Housekeeping), try `raise Deluxe rates by 10%` — it is blocked.
5. Ask `add $25 minibar charge to room 101`, confirm, then say `undo`.

## Checklist before submitting

- [ ] Demo video recorded and link added above
- [ ] Live demo deployed and link added above (or local-run note kept)
- [ ] All team members listed
- [ ] Track confirmed as Startup
