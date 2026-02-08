# archthesis → cuboid-studio Integration

Connects archthesis meme data (Firebase/Firestore) to cuboid-studio's pataphysical meme translation pipeline.

## Architecture

```
cuboid-studio (Vercel)
├── api/
│   ├── fetch-memes.ts          ← NEW: lists memes from archthesis
│   ├── fetch-meme-by-id.ts     ← NEW: single meme + pre-mapped cuboid input
│   └── translate-meme.ts       ← EXISTING: sends to Claude for pataphysical operator
├── src/components/meme/
│   ├── MemeInputPanel.tsx       ← PATCH: add "Browse from archthesis" button
│   └── ArchthesisBrowser.tsx    ← NEW: modal meme picker
├── lib/
│   ├── archthesis-firebase.ts   ← NEW: Firebase Admin SDK init
│   └── meme-mapper.ts           ← NEW: archthesis meme → cuboid input mapping
└── types/
    └── archthesis.ts            ← NEW: shared type definitions
```

## Data Flow

```
User clicks "Browse from archthesis"
  → ArchthesisBrowser opens (modal)
  → GET /api/fetch-memes (Vercel serverless)
  → Firebase Admin SDK reads archthesis Firestore
  → Grid of memes displayed with images, text, tags, likes
  → User selects a meme
  → mapMemeToCuboidInput() converts it:
      memeText + description + tags  →  memeDescription
      location.display_name          →  locationTag
      likes (0-100+)                 →  engagementLevel (1-10)
  → Fields auto-fill in MemeInputPanel
  → Existing translateMeme pipeline takes over (Claude → operator → CSG cut)
```

## Field Mapping

| archthesis                        | cuboid-studio          | notes                            |
|-----------------------------------|------------------------|----------------------------------|
| `memeText` or `topText+bottomText`| `memeDescription`      | Combined with description + tags |
| `location.display_name`           | `locationTag`          | Falls back to `"unknown"`        |
| `likes` count                     | `engagementLevel` 1-10 | Logarithmic bucketing            |
| `tags[]`                          | appended to description| Gives Claude more context        |
| `imageUrl`                        | shown in picker UI     | Not sent to translate pipeline   |

## Setup Steps

### 1. Firebase Service Account

The Vercel functions need a service account to read archthesis's Firestore.

1. Go to **Firebase Console** → project `adaptivememeticarchitect-2776f`
2. **Project Settings** → **Service Accounts** tab
3. Click **"Generate new private key"** → download the JSON file
4. In **Vercel Dashboard** → cuboid-studio project → **Settings** → **Environment Variables**, add:

| Variable                              | Value                                |
|---------------------------------------|--------------------------------------|
| `ARCHTHESIS_FIREBASE_SERVICE_ACCOUNT` | Paste the entire JSON file contents  |
| `ARCHTHESIS_FIREBASE_PROJECT_ID`      | `adaptivememeticarchitect-2776f`     |

### 2. Copy Files into cuboid-studio

From this directory (`integration/cuboid-studio/`), copy:

```
api/fetch-memes.ts          → cuboid-studio/api/fetch-memes.ts
api/fetch-meme-by-id.ts     → cuboid-studio/api/fetch-meme-by-id.ts
lib/archthesis-firebase.ts  → cuboid-studio/src/lib/archthesis-firebase.ts
lib/meme-mapper.ts          → cuboid-studio/src/lib/meme-mapper.ts
types/archthesis.ts         → cuboid-studio/src/types/archthesis.ts
components/ArchthesisBrowser.tsx → cuboid-studio/src/components/meme/ArchthesisBrowser.tsx
```

### 3. Install firebase-admin

```bash
cd cuboid-studio
npm install firebase-admin
```

### 4. Patch MemeInputPanel

See `components/MemeInputPanel-patch.tsx` for the exact changes. Summary:

1. Import `ArchthesisBrowser` and `CuboidMemeInput` type
2. Add `showArchthesisBrowser` state
3. Add a **"Browse from archthesis"** button
4. Render `<ArchthesisBrowser>` with an `onSelect` handler that fills the three fields

### 5. Deploy

```bash
vercel deploy
```

The serverless functions will be available at `/api/fetch-memes` and `/api/fetch-meme-by-id`.

## archthesis Firestore Details

- **Project ID:** `adaptivememeticarchitect-2776f`
- **Collection:** `memes`
- **Read rules:** Public (`allow read: if true`)
- **Ordering field:** `createdAt` (ISO string, descending)
- **Composite indexes:** tags+createdAt, location+createdAt, hidden+createdAt
- **Image storage:** Firebase Storage at `memes/{memeId}.jpg` (public read)

## Firebase Config (public, embedded in deployed JS)

```js
const firebaseConfig = {
  apiKey: "AIzaSyCsb6uQgANSQSnCp6kPhFX7I3TG_PQCd3o",
  authDomain: "adaptivememeticarchitect-2776f.firebaseapp.com",
  projectId: "adaptivememeticarchitect-2776f",
  storageBucket: "adaptivememeticarchitect-2776f.firebasestorage.app",
  messagingSenderId: "297134556666",
  appId: "1:297134556666:web:0e9b06167adde6dc929043"
}
```

Note: This config is safe to share -- it's already public in the client-side JS bundle.
The serverless functions use a separate **service account** (step 1) for admin-level read access.
