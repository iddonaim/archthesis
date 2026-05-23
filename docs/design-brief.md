# archthesis — design direction brief

> A brief for a visual-direction pass on archthesis, a Hebrew-first meme platform with a thesis behind it. Paste this into claude.ai/design to drive the first round of mockups.

## 1. Product in one paragraph

archthesis is a Hebrew-first meme platform with a thesis behind it. Users create memes on an in-browser canvas editor, attach each meme to a real location, tag it, and publish to a shared gallery. The thesis framing treats the collected memes as a *corpus* — a field archive of vernacular visual humor tied to place. The project is already live and has real users; this pass is a visual overhaul, not a zero-to-one design.

## 2. The north star: absurd-harmony

The entire visual direction sits on what the author calls the **absurd-harmony axis**. Two registers cohabit at full strength:

- **Meme register** — bold, playful, confident, unembarrassed. Memes fill their frames. Display type does real work. Color is allowed to be loud.
- **Scholarly register** — considered, precise, editorial, earnestly academic. Metadata is typeset like footnote apparatus. Chrome around the memes whispers at PhD register.

Both voices are *sincere*. Neither is ironized. The harmony is that they don't fight — each speaks in its own voice, at full volume, in the right place. A meme of a dog in sunglasses captioned with the typographic care of a journal footnote is the genre this product lives in. The product *is* the visual thesis; the actual written thesis exists as a parallel artifact in plain 12pt Arial / 1.5 line-height / APA citations and is deliberately **not** a visual reference here.

**Not this:**
- Muted-tasteful, editorial-restrained. Memes stay loud.
- Ironic-academic (mock footnotes, fake Latin, winking at scholarly conventions). The scholarly register is sincere, not a bit.
- Tumblr maximalism, y2k chaos, vaporwave. The harmony depends on each register being internally coherent, not noise.
- Canva-playful default meme-maker aesthetic.
- Skeuomorphism (torn paper, taped memos). Editorial ≠ scrapbook.
- Generic "enterprise" admin panel. The admin console reads research-station, not Salesforce.

## 3. Audience & context

- Hebrew-first users, Israel. Right-to-left layout by default; mixed Hebrew + English + numerals in captions is common and must render correctly.
- Mobile-first creation, desktop-first gallery browsing. Both matter.
- Single curator on the admin side (opposite register from the public side — research-station aesthetic, dense, precise).

## 4. Stack & constraints to design into

- **React + Tailwind CSS + Konva.js (canvas editor) + Firebase.** Mockups should come back as runnable Tailwind-friendly React components so they port directly.
- Existing color tokens (feel free to propose replacements — nothing sacred):
  - primary `#FF6B6B` (coral), secondary `#4ECDC4` (teal), accent `#FFE66D` (yellow), dark `#2C3E50`
- Current body font: Heebo. Propose your own.
- RTL by default. Any LTR exception must be explicit.
- No existing component-library dependency. Bespoke primitives are welcome; if you reach for shadcn / Radix, say so in notes.

## 5. Typography — please propose three pairs

Two type systems, one product:

- **Display / meme register** — a bold Hebrew sans (or display) for meme canvases, page heroes, primary CTAs, big numbers. Candidates to consider: Heebo, Secular One, Rubik, Varela Round, Assistant, Suez One, something mono-leaning. Pair with an LTR display that carries similar character.
- **Editorial / scholarly register** — a Hebrew serif for metadata, captions, admin, about, legal, catalog numbers. Candidates: David Libre, Frank Ruhl Libre, Bellefair, Shofar. Pair with an LTR serif sibling.

For each of the three pairs, provide a type specimen: H1 / H2 / body / meta / caption / numeric, with concrete weights / sizes / leading / tracking. Show at least one Hebrew sample and one mixed Hebrew-English sample per register.

## 6. Microcopy — please propose three registers

*(Microcopy = the small, functional text on buttons, placeholders, labels, tooltips, empty states. It is the product's audible voice.)*

Current state is tonally neutral: `"הוסף טקסט לקנבס"`, `"כתוב כאן..."`, `"עורך הגיחוכים"`. Propose three full rewrites so they can be compared side-by-side:

- **A · Dual register** *(author's leaning, baseline)* — meme surfaces get colloquial, imperative, short, meme-adjacent Hebrew; scholarly surfaces get elevated, nominal, careful Hebrew. Never blended; always context-appropriate.
- **B · Uniform scholarly** — everything at the elevated register; absurdity lives in *what* is being catalogued, not in *how* it's labelled. Dryer, more deadpan.
- **C · Uniform colloquial** — everything at meme register. Named for contrast; probably the wrong answer, but worth seeing for calibration.

For each variant, rewrite this concrete string set:

**Editor:**
- "Add text to canvas" (currently `הוסף טקסט לקנבס`)
- Placeholder in new text box (currently `כתוב כאן...`)
- "Publish meme" (currently `פרסם גיחוך`)
- "Choose template" (currently `בחרו תבנית`)
- "Start fresh" (currently `התחל מחדש`)
- Unsaved-work modal title (currently `רגע, יש לך גיחוך בעבודה!`)

**Gallery:**
- Filter bar label
- Empty state ("no memes match these filters")
- Like button a11y label
- Lightbox caption lead-in

**Admin:**
- Meme management tab title
- "Hide meme" toggle label
- Contact-messages header
- Empty inbox state

Also propose the Hebrew label for the product's own vocabulary: the current word for "meme" in the product is `גיחוך` (chuckle). Keep, evolve, or replace — your call; show your pick in the rewrites.

## 7. Scope — three screens, each at full resolution

### Screen 1 · Editor shell (highest priority — this is the overhaul target)

**Today:** canvas in the center-left, 4-tab right sidebar (Text / Emoji / Location / Tags), publish button at the bottom of the sidebar. User edits by clicking a tab, hunting for a control, adjusting, watching the canvas update.

**Goal:** canvas as hero; *direct manipulation* replaces tab-hunting. An inline floating toolbar anchors to the selected element (color / size / font / rotation / delete). A thin right-hand properties inspector auto-populates from the current selection. Sticker picker opens as a drawer, not a tab. On mobile, the sidebar becomes a bottom sheet that doesn't fight the keyboard. Undo / redo live in a persistent header.

**New element types to design for:** custom image stickers (in addition to emoji), optionally sourced from curated packs / user uploads / location-matched discovery.

**States to mock:**
- Desktop · empty canvas, nothing selected
- Desktop · text element selected, inline toolbar visible
- Desktop · sticker picker drawer open (emoji + image stickers, both)
- Mobile · bottom sheet collapsed (canvas + compact toolbar)
- Mobile · text being edited, virtual keyboard open

### Screen 2 · Gallery grid

**Today:** uniform thumbnail grid, filter bar on top.

**Goal:** a scrollable catalogue of the corpus. Memes at full visual volume *inside* their cards; card chrome typeset like a field entry — catalog number, location, date, contributor (anon/username), tag chips — all at editorial register. The meme screams; the catalogue whispers. Handle variable aspect ratios without cropping punchlines.

**States to mock:**
- Desktop grid, ~24 items, mixed aspect ratios
- Mobile grid
- Filtered state (e.g. `מיקום: תל אביב-יפו`)

### Screen 3 · Gallery card + lightbox

Two things: the card that lives in the grid (covered above), plus the lightbox that opens when you click one.

**Lightbox goal:** meme centered at maximum legible size, surrounded by genuine editorial apparatus — full catalog entry (number, location with coordinates, date, contributor, tags), a short commentary / description slot, a "similar entries" strip (by location or tag). Monograph plate facing a commentary page — not Instagram modal.

**States to mock:**
- Desktop lightbox, open
- Mobile lightbox, open

## 8. Output I want back

For each of **three distinct, internally-consistent directions** (so nine artifacts total: 3 directions × 3 screens):

1. One paragraph of directional intent — what this direction *believes about the product*.
2. A runnable React + Tailwind artifact, responsive, RTL, Hebrew content, light mode. Placeholder memes can be solid colored blocks with Hebrew captions — don't fetch real images.
3. A notes block listing: which tokens changed, which new tokens introduced, which components are reusable primitives vs. one-offs, which Google Fonts / font stack the direction uses.

Name each direction memorably (e.g. `corpus`, `tabloid`, `atlas`) so the author can talk about them.

**Internal consistency matters:** within a direction, all three screens share the same typographic pair, palette, component language, and microcopy register. Don't mix directions within a screen.

## 9. Second round (not in this pass, but know they exist)

Screens deferred to a later round, so direction choices don't paint them into a corner:
- Home page hero + navigation
- Location picker (distinctive, deserves its own thought)
- Admin console shell (meme management, contact messages, analytics, + a new "discovered memes" tab for location-matched external scraping)

## 10. What happens with the output

The author picks one direction (or asks for a fourth that combines elements). That direction is then implemented in the real codebase alongside an architectural overhaul of the editor — unified scene model, undo/redo, image stickers, inline toolbar, mobile bottom sheet. The chosen typography + palette + microcopy register become the new Tailwind tokens and string catalog.
