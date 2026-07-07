# The Giggletecture Machine (מכונת הגיחוך וההגחה)

A Hebrew-first platform for creating and sharing memes about the built environment —
an architecture thesis project by Iddo Naim (Tel Aviv University).

**Live site:** https://memes.iddonaim.com/
(Firebase hosting URL: https://adaptivememeticarchitect-2776f.web.app)

**Status:** Live in production. See [CHANGELOG.md](./CHANGELOG.md) for version history.

## 🚀 Quick Start

```bash
npm install
cp .env.example .env   # then fill in the Firebase values (see below)
npm run dev
```

Open http://localhost:5173/

> **Note:** a `.env` file with real Firebase credentials is required — the
> production build intentionally fails if the `VITE_FIREBASE_*` variables are
> missing (see `scripts/check-env.mjs`). Setup instructions live in
> [docs/FIREBASE_SETUP_GUIDE.md](./docs/FIREBASE_SETUP_GUIDE.md).

## 📦 Tech Stack

- **React 19** + **TypeScript** — UI
- **Vite** — build tool & dev server (with PWA plugin)
- **Tailwind CSS** — styling
- **Zustand** — state management
- **React Router** — routing
- **Konva.js / react-konva** — canvas meme editor
- **Firebase** — Firestore, Storage, Auth, Hosting, App Check
- **i18next** — Hebrew/English internationalization (RTL-first)
- **Vitest + Testing Library** — tests
- **Framer Motion**, **HeadlessUI**, **Lucide React** — animation, accessible components, icons

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/       # Admin dashboard (analytics, meme & message management)
│   ├── common/      # Reusable UI (Button, Modal, ConsentModal, LanguageToggle, ...)
│   ├── editor/      # Canvas editor, template selector, tool panels
│   ├── gallery/     # Gallery grid, cards, lightbox, filters, sorting
│   ├── home/        # Homepage sections (featured carousel)
│   └── layout/      # Header, Footer, Layout
├── pages/           # Route pages (Home, Gallery, Create, Privacy, Admin)
├── stores/          # Zustand stores (memes, editor, scene)
├── hooks/           # usePublishMeme, useTagSuggestions
├── contexts/        # AuthContext (admin auth)
├── i18n/            # i18next setup + he/en locale files
├── lib/             # Firebase config, templates, cache, utils
├── types/           # TypeScript type definitions
└── App.tsx          # Routing + providers
```

## 🌐 Routes

- `/` — Homepage
- `/gallery` — Meme gallery with real-time updates
- `/create` — Canvas meme editor
- `/privacy` — Privacy policy
- `/admin` — Admin panel (protected; `/admin/login`)

## 📝 Development Commands

```bash
npm run dev            # Start dev server (http://localhost:5173)
npm run build          # Production build (env check + type check + version stamp)
npm run build:analyze  # Build with bundle-size visualization
npm run preview        # Preview production build
npm run lint           # ESLint
npm test               # Vitest (watch mode)
npm run test:coverage  # Tests with coverage report
```

## 🔥 Firebase

- **Firestore** — `memes` and `contact_messages` collections (rules in `firestore.rules`)
- **Storage** — user-uploaded meme images, 20MB/image limit (rules in `storage.rules`)
- **Auth** — admin access via custom claims (no hardcoded admins)
- **App Check** — reCAPTCHA v3 bot protection
- **Hosting** — deploys the `dist/` build (`firebase deploy`)

## 🎨 Design System

Custom Tailwind theme:
- Primary: `#FF6B6B` (red) · Secondary: `#4ECDC4` (cyan) · Accent: `#FFE66D` (yellow) · Dark: `#2C3E50` (navy)
- Fonts: Heebo, IBM Plex Sans Hebrew
- Direction: RTL by default, with an English (LTR) toggle

Design direction for the visual-overhaul pass: [docs/design-brief.md](./docs/design-brief.md)

## 📚 Documentation

- [CHANGELOG.md](./CHANGELOG.md) — full development history, newest first
- [docs/FIREBASE_SETUP_GUIDE.md](./docs/FIREBASE_SETUP_GUIDE.md) — Firebase setup & deployment
- [docs/design-brief.md](./docs/design-brief.md) — visual design direction
- [docs/REVIEW_2026-07.md](./docs/REVIEW_2026-07.md) — July 2026 repo review & suggestions
- [docs/archive/](./docs/archive/) — historical session notes (kept for reference, not maintained)

## 📄 License

Part of the Archthesis project — educational use.

Sticker artwork in `src/assets/stickers/` is [Twemoji](https://github.com/jdecked/twemoji)
(© Twitter, Inc. and other contributors), licensed under
[CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) — see
`src/assets/stickers/LICENSE.md`.
