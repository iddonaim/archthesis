/**
 * "Browse from archthesis" meme picker component for cuboid-studio.
 *
 * Drop this file into cuboid-studio/src/components/meme/ArchthesisBrowser.tsx
 *
 * Displays a modal/panel with a searchable grid of memes from archthesis.
 * When the user selects a meme, it maps the data to cuboid-studio's
 * { memeDescription, locationTag, engagementLevel } format and passes
 * it back via the onSelect callback.
 *
 * Usage in MemeInputPanel:
 *   <ArchthesisBrowser
 *     isOpen={showBrowser}
 *     onClose={() => setShowBrowser(false)}
 *     onSelect={(cuboidInput) => {
 *       setMemeDescription(cuboidInput.memeDescription)
 *       setLocationTag(cuboidInput.locationTag)
 *       setEngagementLevel(cuboidInput.engagementLevel)
 *     }}
 *   />
 */

import { useState, useEffect, useCallback } from 'react'
import type { ArchthesisMeme, CuboidMemeInput, FetchMemesResponse } from '../types/archthesis'

interface ArchthesisBrowserProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (input: CuboidMemeInput) => void
}

// Client-side mapping (same logic as lib/meme-mapper.ts but for the browser)
function mapMeme(meme: ArchthesisMeme): CuboidMemeInput {
  // Build description
  const parts: string[] = []
  if (meme.memeText) {
    parts.push(meme.memeText)
  } else {
    if (meme.topText) parts.push(meme.topText)
    if (meme.bottomText) parts.push(meme.bottomText)
  }
  if (meme.description) parts.push(meme.description)
  if (meme.tags.length > 0) parts.push(`[tags: ${meme.tags.join(', ')}]`)

  // Extract location
  let locationTag = 'unknown'
  if (meme.location) {
    locationTag = typeof meme.location === 'string'
      ? meme.location
      : meme.location.display_name || 'unknown'
  }

  // Map engagement
  const likes = meme.likes || 0
  let engagementLevel = 1
  if (likes > 100) engagementLevel = 10
  else if (likes > 50) engagementLevel = 9
  else if (likes > 20) engagementLevel = 7
  else if (likes > 5) engagementLevel = 5
  else if (likes > 0) engagementLevel = 3

  return {
    memeDescription: parts.join(' | '),
    locationTag,
    engagementLevel,
  }
}

export default function ArchthesisBrowser({ isOpen, onClose, onSelect }: ArchthesisBrowserProps) {
  const [memes, setMemes] = useState<ArchthesisMeme[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tag, setTag] = useState('')
  const [sort, setSort] = useState<'recent' | 'popular' | 'oldest'>('recent')
  const [page, setPage] = useState(0)
  const [selectedMeme, setSelectedMeme] = useState<ArchthesisMeme | null>(null)

  const LIMIT = 12

  const fetchMemes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        limit: String(LIMIT),
        offset: String(page * LIMIT),
        sort,
      })
      if (search.trim()) params.set('search', search.trim())
      if (tag) params.set('tag', tag)

      const res = await fetch(`/api/fetch-memes?${params}`)
      if (!res.ok) throw new Error('Failed to fetch memes')

      const data: FetchMemesResponse = await res.json()
      setMemes(data.memes)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load memes')
    } finally {
      setLoading(false)
    }
  }, [page, sort, search, tag])

  // Fetch when panel opens or filters change
  useEffect(() => {
    if (isOpen) fetchMemes()
  }, [isOpen, fetchMemes])

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setPage(0)
      setSelectedMeme(null)
    }
  }, [isOpen])

  const handleConfirm = () => {
    if (!selectedMeme) return
    onSelect(mapMeme(selectedMeme))
    onClose()
  }

  if (!isOpen) return null

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#1a1a2e', color: '#e0e0e0', borderRadius: 12,
        width: '90vw', maxWidth: 900, maxHeight: '85vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        border: '1px solid #333',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #333',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            Browse archthesis memes
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#999',
            fontSize: 22, cursor: 'pointer', lineHeight: 1,
          }}>
            &times;
          </button>
        </div>

        {/* Filters */}
        <div style={{
          padding: '12px 20px', borderBottom: '1px solid #333',
          display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <input
            type="text"
            placeholder="Search memes..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            style={{
              flex: 1, minWidth: 180, padding: '8px 12px', borderRadius: 6,
              background: '#0d0d1a', border: '1px solid #444', color: '#e0e0e0',
            }}
          />
          <select
            value={sort}
            onChange={e => { setSort(e.target.value as typeof sort); setPage(0) }}
            style={{
              padding: '8px 12px', borderRadius: 6,
              background: '#0d0d1a', border: '1px solid #444', color: '#e0e0e0',
            }}
          >
            <option value="recent">Newest</option>
            <option value="popular">Most liked</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {loading && <p style={{ textAlign: 'center', color: '#999' }}>Loading...</p>}
          {error && <p style={{ textAlign: 'center', color: '#ff6b6b' }}>{error}</p>}
          {!loading && !error && memes.length === 0 && (
            <p style={{ textAlign: 'center', color: '#999' }}>No memes found</p>
          )}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
          }}>
            {memes.map(meme => (
              <div
                key={meme.id}
                onClick={() => setSelectedMeme(meme)}
                style={{
                  cursor: 'pointer', borderRadius: 8, overflow: 'hidden',
                  border: selectedMeme?.id === meme.id
                    ? '2px solid #6c63ff'
                    : '2px solid transparent',
                  background: '#0d0d1a',
                  transition: 'border-color 0.15s',
                }}
              >
                <img
                  src={meme.imageUrl}
                  alt={meme.memeText || meme.topText || 'meme'}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div style={{ padding: '8px 10px' }}>
                  <div style={{
                    fontSize: 11, color: '#999',
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span>{meme.likes} likes</span>
                    <span>{meme.tags.slice(0, 2).join(', ')}</span>
                  </div>
                  {(meme.memeText || meme.topText) && (
                    <div style={{
                      fontSize: 12, marginTop: 4,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {meme.memeText || meme.topText}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer: pagination + confirm */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #333',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              style={{
                padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
                background: '#333', border: 'none', color: '#e0e0e0',
                opacity: page === 0 ? 0.4 : 1,
              }}
            >
              Prev
            </button>
            <span style={{ fontSize: 13, color: '#999' }}>
              {total > 0 ? `${page + 1} / ${totalPages}` : '0 results'}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              style={{
                padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
                background: '#333', border: 'none', color: '#e0e0e0',
                opacity: page >= totalPages - 1 ? 0.4 : 1,
              }}
            >
              Next
            </button>
          </div>

          {/* Selected meme preview + confirm */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {selectedMeme && (
              <span style={{ fontSize: 13, color: '#6c63ff' }}>
                Selected: {selectedMeme.id.slice(0, 20)}...
              </span>
            )}
            <button
              disabled={!selectedMeme}
              onClick={handleConfirm}
              style={{
                padding: '8px 20px', borderRadius: 6, cursor: 'pointer',
                background: selectedMeme ? '#6c63ff' : '#333',
                border: 'none', color: '#fff', fontWeight: 600,
                opacity: selectedMeme ? 1 : 0.4,
              }}
            >
              Use this meme
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
