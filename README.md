# PeerFlow

Self-hosted P2P streaming application. Add magnet links, download via BitTorrent, stream video in your browser.

## Features

- Add torrents via magnet links or `.torrent` files
- Stream video directly in the browser while downloading
- Sequential piece downloading for immediate playback
- Real-time download progress via WebSocket
- HTTP Range requests for seeking support
- Multi-user with admin accounts (Phase 2)
- Media library with TMDB metadata (Phase 3)
- Torrent search via Jackett/Prowlarr (Phase 4)
- Subtitle support via OpenSubtitles (Phase 4)
- On-demand transcoding via FFmpeg (Phase 5)
- Local or Azure Blob storage (Phase 5)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, shadcn/ui |
| Backend | NestJS, TypeORM |
| Torrent Engine | WebTorrent |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Real-time | Socket.IO |
| Monorepo | Turborepo, pnpm |
| Deploy | Docker Compose |

## Quick Start

### Prerequisites

- Docker & Docker Compose

### Development

```bash
git clone https://github.com/2xkl/PeerFlow.git
cd PeerFlow
cp .env.example .env
docker compose -f docker-compose.dev.yml up
```

- Frontend: http://localhost:3000
- API: http://localhost:4000/api/v1/health

### Project Structure

```
PeerFlow/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # NestJS backend
├── packages/
│   ├── shared/           # Shared types, constants, utils
│   ├── ts-config/        # TypeScript configurations
│   └── eslint-config/    # ESLint configurations
├── docker-compose.dev.yml
├── Dockerfile.dev
└── turbo.json
```

## Development

The dev environment runs everything in Docker. Source directories are mounted as volumes for hot-reload:

- `apps/web/src` — Next.js pages and components
- `apps/api/src` — NestJS modules and services
- `packages/shared/src` — Shared TypeScript code

Changes to source files are automatically picked up by the watchers inside the container.

## License

MIT
