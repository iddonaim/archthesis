import { create } from 'zustand'
import { cache } from '@/lib/cache'
import type { Meme } from '@/types/meme'

interface MemeStore {
  memes: Meme[]
  likedMemes: string[]
  loading: boolean
  error: string | null

  // Actions
  setMemes: (memes: Meme[]) => void
  addMeme: (meme: Meme) => void
  updateMeme: (id: string, updates: Partial<Meme>) => void
  deleteMeme: (id: string) => void
  toggleLike: (memeId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  getCachedMemes: () => Meme[] | null
}

// Load initial memes from cache or localStorage
const loadInitialMemes = (): Meme[] => {
  // Try cache first (with TTL)
  const cached = cache.get<Meme[]>('gallery:memes')
  if (cached) {
    return cached
  }

  // Fallback to localStorage (persistent but no TTL)
  try {
    const stored = localStorage.getItem('memes:snapshot')
    if (stored) {
      const parsed = JSON.parse(stored)
      // Convert timestamp strings back to Date objects
      return parsed.map((meme: any) => ({
        ...meme,
        timestamp: new Date(meme.timestamp)
      }))
    }
  } catch (error) {
    console.warn('Failed to load cached memes:', error)
  }

  return []
}

export const useMemeStore = create<MemeStore>((set, get) => ({
  memes: loadInitialMemes(),
  likedMemes: JSON.parse(localStorage.getItem('likedMemes') || '[]'),
  loading: false,
  error: null,

  setMemes: (memes) => {
    set({ memes })

    // Cache in memory with 5 minute TTL
    cache.set('gallery:memes', memes, 5 * 60 * 1000)

    // Persist to localStorage (no TTL, survives browser close)
    try {
      localStorage.setItem('memes:snapshot', JSON.stringify(memes))
    } catch (error) {
      console.warn('Failed to persist memes to localStorage:', error)
    }
  },

  addMeme: (meme) => set((state) => ({
    memes: [meme, ...state.memes]
  })),

  updateMeme: (id, updates) => set((state) => ({
    memes: state.memes.map(meme =>
      meme.id === id ? { ...meme, ...updates } : meme
    )
  })),

  deleteMeme: (id) => set((state) => ({
    memes: state.memes.filter(meme => meme.id !== id)
  })),

  toggleLike: (memeId) => set((state) => {
    const liked = state.likedMemes.includes(memeId)
    const newLiked = liked
      ? state.likedMemes.filter(id => id !== memeId)
      : [...state.likedMemes, memeId]

    localStorage.setItem('likedMemes', JSON.stringify(newLiked))

    return { likedMemes: newLiked }
  }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  getCachedMemes: () => cache.get<Meme[]>('gallery:memes')
}))
