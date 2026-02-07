# Archthesis React - Meme Generator Migration

React + TypeScript rewrite of the Adaptive Memetic Architect (מכונת הגיחוך וההגחה).

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173/

## 📦 Tech Stack

- **React 18.2** - UI framework
- **TypeScript 5.3** - Type safety
- **Vite 7.3** - Build tool & dev server
- **Tailwind CSS 3.4** - Styling
- **Zustand 4.4** - State management
- **React Router 6.21** - Routing
- **Konva.js 9.3** - Canvas manipulation
- **Firebase 10.7** - Backend (Firestore, Storage, Auth)
- **HeadlessUI** - Accessible components
- **Lucide React** - Icons

## 📁 Project Structure

```
src/
├── components/
│   ├── common/      # Reusable UI components (Button, Modal, Card, etc.)
│   ├── gallery/     # Gallery-specific components (MemeCard, FilterBar, etc.)
│   └── layout/      # Layout components (Header, Footer)
├── pages/           # Route pages (HomePage, GalleryPage, CreatePage, AdminPage)
├── stores/          # Zustand state stores (useMemeStore, useEditorStore)
├── types/           # TypeScript type definitions
├── lib/             # Utilities & Firebase config
└── App.tsx          # Main app with routing
```

## 🎯 Current Status

**Completed:**
- ✅ Week 1: Foundation, Firebase setup, Design system
- ✅ Week 2 Day 8-10: Gallery page with real-time Firebase

**In Progress:**
- 🔄 Week 2 Day 11-14: Homepage enhancements & lazy loading

**Upcoming:**
- Week 3-4: Canvas editor with Konva.js
- Week 5: Admin panel & testing
- Week 6: Deploy to production

See `SESSION_NOTES.md` for detailed progress.

## 🔥 Firebase Configuration

Uses the same Firebase project as the original site:
- Project ID: `adaptivememeticarchitect-2776f`
- Collections: `memes`
- Storage bucket: User-uploaded images
- **No data migration needed** - existing memes will work

## 📝 Development Commands

```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build
npx tsc --noEmit   # TypeScript type check
```

## 🎨 Design System

Custom Tailwind theme:
- Primary: `#FF6B6B` (red)
- Secondary: `#4ECDC4` (cyan)
- Accent: `#FFE66D` (yellow)
- Dark: `#2C3E50` (navy)
- Font: Heebo (Hebrew support)
- Direction: RTL (right-to-left)

## 📚 Documentation

- `SESSION_NOTES.md` - Detailed session progress and next steps
- Migration plan: `/Users/kageyoshiki/.claude/plans/sequential-purring-moon.md`

## 🌐 Routes

- `/` - Homepage (hero, features, CTA)
- `/gallery` - Meme gallery with real-time updates
- `/create` - Meme editor (Week 3-4)
- `/admin` - Admin panel (Week 5)

## 📄 License

Part of Archthesis project - Educational use.
