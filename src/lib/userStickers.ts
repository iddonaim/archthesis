/**
 * Personal sticker library — uploaded stickers persist in localStorage so
 * they reappear in the panel on the next visit, like a messaging app's
 * sticker keyboard.
 *
 * Stickers are stored as data URLs (already downscaled by the upload flow).
 * localStorage is small (~5MB), so the library is capped and quota errors
 * degrade gracefully: the sticker still lands on the canvas, it just isn't
 * remembered.
 */

export interface UserSticker {
  id: string
  src: string
  aspect: number
  addedAt: number
}

const STORAGE_KEY = 'userStickerLibrary_v1'
export const USER_STICKER_LIMIT = 12

export function loadUserStickers(): UserSticker[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (s): s is UserSticker =>
        s && typeof s.id === 'string' && typeof s.src === 'string' && typeof s.aspect === 'number'
    )
  } catch {
    return []
  }
}

const persist = (stickers: UserSticker[]): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stickers))
    return true
  } catch {
    return false
  }
}

/**
 * Add a sticker to the library (newest first, capped). Returns the new list
 * and whether it could actually be persisted.
 */
export function saveUserSticker(src: string, aspect: number): { stickers: UserSticker[]; persisted: boolean } {
  const sticker: UserSticker = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    src,
    aspect,
    addedAt: Date.now(),
  }
  let stickers = [sticker, ...loadUserStickers()].slice(0, USER_STICKER_LIMIT)

  // On quota errors, drop oldest entries until it fits (or give up)
  while (stickers.length > 0) {
    if (persist(stickers)) return { stickers, persisted: true }
    stickers = stickers.slice(0, -1)
  }
  return { stickers: loadUserStickers(), persisted: false }
}

export function removeUserSticker(id: string): UserSticker[] {
  const stickers = loadUserStickers().filter((s) => s.id !== id)
  persist(stickers)
  return stickers
}
