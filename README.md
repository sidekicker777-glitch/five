# FiveM Prompt Maker - Next.js

A shareable prompt-builder website for FiveM projects that works well with QBCore, standalone setups, and a broad QS ecosystem. It includes:

- a polished frontend prompt-builder page
- grouped extras by category instead of one long list
- preset sharing by URL
- preset import/export as JSON
- a server-side `/api/docsbot/chat-agent` proxy route
- environment variable support for private or public DocsBot bots
- deploy-ready structure for Vercel or other Node hosts

## Features

- **FiveM-focused prompt builder** for scripts, UI, debugging, MLO/mapping, items, and full systems
- **Grouped extras** for builder tools, UI polish, framework bridges, gameplay logic, persistence, economy/storage, and ops/security
- **QS-aware** resource picker with broad package coverage
- **DocsBot integration** via server route so secrets stay off the client
- **Share with friends** using a URL-safe preset token or exported preset JSON

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

## Environment variables

Copy `.env.example` to `.env.local`.

### Recommended options

For a **trusted backend** using a DocsBot user API key:

```env
DOCSBOT_API_KEY=YOUR_DOCSBOT_API_KEY
NEXT_PUBLIC_DEFAULT_TEAM_ID=YOUR_TEAM_ID
NEXT_PUBLIC_DEFAULT_BOT_ID=YOUR_BOT_ID
```

For a **private bot** using DocsBot's recommended JWT signing flow:

```env
DOCSBOT_SIGNATURE_KEY=YOUR_DOCSBOT_SIGNATURE_KEY
DOCSBOT_TEAM_ID=YOUR_TEAM_ID
DOCSBOT_BOT_ID=YOUR_BOT_ID
NEXT_PUBLIC_DEFAULT_TEAM_ID=YOUR_TEAM_ID
NEXT_PUBLIC_DEFAULT_BOT_ID=YOUR_BOT_ID
```

## How the proxy works

The project includes:

- `app/api/docsbot/chat-agent/route.ts`

That route receives:

```json
{
  "teamId": "YOUR_TEAM_ID",
  "botId": "YOUR_BOT_ID",
  "payload": {
    "question": "...",
    "stream": false,
    "conversationId": "uuid"
  }
}
```

Then it forwards the request to DocsBot's Chat Agent endpoint from the server.

## Deploy to Vercel

1. Push this project to GitHub.
2. Import it into Vercel.
3. Add your environment variables.
4. Deploy.

## Deploy to another host

Any host that supports a Next.js Node server or Next standalone output will work. Common options:

- Vercel
- Railway
- Render
- VPS with Node + reverse proxy

## Notes

- Public bots can work without auth, but private bots should use a server-side API key or DocsBot JWT signing.
- Do **not** put DocsBot secrets in frontend code.


## v7 brief-first prompt flow

This build adds a quick brief box, a prompt enhancement action, and a random prompt action that uses currently selected extras and integrations.
