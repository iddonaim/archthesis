# Structure record — archthesis (Layers 2–3)

Per-repo half of the layered structure record for the three-system group (cuboid-studio ·
map-context · archthesis). Layers 0–1 (system map, cross-system contracts) live in
`cuboid-studio/docs/SYSTEM-STRUCTURE.md`. Every claim cites `file:line` at the commit under
**Extracted**.

---

## Layer 2 — Data schemas

### 2.1 Collections archthesis owns

Firestore is schemaless; shapes below come from the write sites (all found by grepping
`addDoc|setDoc|updateDoc|deleteDoc|increment` across `src/`). Code writes exactly **two**
collections:

**`memes/{id}`** — created by `src/hooks/usePublishMeme.ts:136-156` (`addDoc` at `:156`), after
the image uploads to Firebase Storage at `memes/{memeId}.jpg` (`:124-133`):

| Field | Type as written | Notes |
|---|---|---|
| `imageUrl` | string | Storage download URL of the exported JPEG |
| `memeText` | string | combined text of all non-placeholder text boxes (`:43-48,138`) |
| `description` | string | `''` when empty |
| `tags` | string[] | |
| `location` | object \| null | `{ latitude, longitude, display_name, showInGallery, hideFromGallery }` (`:141-147`) |
| `username` | string | `''` when empty |
| `likes` | number | `0` at create; rules enforce this (`firestore.rules:23`) |
| `hidden` | boolean | `false` at create |
| `timestamp` | server timestamp | `serverTimestamp()` |
| `createdAt` | string | client `new Date().toISOString()` |
| `originSource` | string | QR-origin from `localStorage`, default `'link'` |

Later mutations: `likes: increment(±1)` (`src/components/gallery/MemeCard.tsx:46-48`,
`Lightbox.tsx:52-54`); admin `hidden` toggle (`src/components/admin/MemeManagementTable.tsx:65-67`);
admin delete incl. the Storage object (`:86` onward).

**Legacy fields.** The repo's own `Meme` type (`src/types/meme.ts:1-22`) still declares
`topText`/`bottomText` (required), `userId`, and a legacy **string** form of `location` — none of
which the current publish code writes. The gallery still renders `topText`/`bottomText`
(`MemeCard.tsx:125,161`), so pre-migration documents display; new documents show these as empty.
The security rules also still guard the legacy fields' lengths (`firestore.rules:24-25`).

**`contact_messages/{id}`** — created by `src/components/common/ContactModal.tsx:35-43`:
`{ name, email, message, source, timestamp: serverTimestamp, createdAt: ISO string,
status: 'unread' }`. Admin marks `status: 'read'` (`src/components/admin/ContactMessagesTable.tsx:79-81`)
or deletes (`:69`). Admin-only read (`firestore.rules:55-64`). Internal to archthesis — cuboid
never reads it.

### 2.2 Declared but unused collections

`firestore.rules` declares two collections **no code reads or writes** (verified by grep):
`templates` (`:40-46`, commented "future use") and `analytics` (`:49-52`; the admin "analytics"
tab computes from `memes` client-side, `src/components/admin/Analytics.tsx:47`).

### 2.3 This repo deploys the shared project's rules

archthesis is the only one of the three repos with a `firebase.json` (`"firestore"` block wiring
`firestore.rules` + `firestore.indexes.json`), so **its rules file governs the whole shared
Firebase project** — including cuboid-studio's five collections, whose rule blocks sit at
`firestore.rules:89-125` (`lexicons`, `translationLexicons`, `projects` → `sites` →
`compositions`). Cuboid keeps a near-identical reference copy in its own repo (differs by one
comment line as of this extraction). Consumers of `memes` outside this repo rely on the public
read rule at `firestore.rules:18`.

---

## Layer 3 — Module & flow architecture

*Not yet extracted. Next layer boundary.*

---

## DRIFT

- This repo has no `CONTEXT.md`, so there are no context-sync deltas to record here.
- Cross-repo finding (also logged in `cuboid-studio/STRUCTURE.md`): two near-identical
  `firestore.rules` copies exist, one per repo, with only this repo's actually deployed —
  a silent-drift risk. Flagged, not fixed.

## Regenerate

```bash
# Re-verify Layer 2 claims (from the repo root):
grep -rnE "addDoc|setDoc|updateDoc|deleteDoc|increment\(" src --include=*.ts --include=*.tsx
sed -n '136,156p' src/hooks/usePublishMeme.ts        # memes create shape
sed -n '35,43p' src/components/common/ContactModal.tsx
grep -n "match /" firestore.rules                    # all declared collections
grep -rn "'templates'\|'analytics'" src              # confirm still unused
```

## Extracted

Extracted 2026-08-30 against archthesis `625ea8d` (cross-references: cuboid-studio `a4fe78a`,
map-context `1ae8f6c`).
