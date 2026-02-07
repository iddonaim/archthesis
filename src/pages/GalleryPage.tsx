import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useMemeStore } from '@/stores/useMemeStore'
import Layout from '@/components/layout/Layout'
import FilterBar from '@/components/gallery/FilterBar'
import SortControls, { type SortOption } from '@/components/gallery/SortControls'
import MemeGrid from '@/components/gallery/MemeGrid'
// import Input from '@/components/common/Input'
import { LoadingState } from '@/components/common/Spinner'
import { Search, X } from 'lucide-react'
import type { Meme } from '@/types/meme'

export default function GalleryPage() {
  const [searchParams] = useSearchParams()
  const { memes, setMemes } = useMemeStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')

  // Get meme ID from URL query param (for shared links)
  const initialMemeId = searchParams.get('meme')

  // Real-time Firestore listener
  useEffect(() => {
    const q = query(
      collection(db, 'memes'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const memesData: Meme[] = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            imageUrl: data.imageUrl,
            topText: data.topText || '',
            bottomText: data.bottomText || '',
            memeText: data.memeText || undefined, // Searchable text from all text boxes
            description: data.description || undefined,
            tags: data.tags || [],
            location: data.location || undefined,
            username: data.username || undefined,
            likes: data.likes || 0,
            timestamp: data.timestamp instanceof Timestamp
              ? data.timestamp.toDate()
              : (data.createdAt ? new Date(data.createdAt) : new Date()),
            userId: data.userId,
            hidden: data.hidden || false
          }
        })

        setMemes(memesData)
        setIsLoading(false)
      },
      (err) => {
        console.error('Error fetching memes:', err)
        setError('שגיאה בטעינת הגיחוכים. נסו לרענן את הדף.')
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [setMemes])

  // Filter and sort memes
  const filteredAndSortedMemes = useMemo(() => {
    let filtered = memes

    // Filter out hidden memes (admin only can see them)
    filtered = filtered.filter((meme) => !meme.hidden)

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((meme) =>
        selectedTags.some((tag) => meme.tags.includes(tag))
      )
    }

    // Unified search across all fields
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((meme) => {
        // Helper to safely check if a string includes the search query
        const includes = (str: string | null | undefined): boolean =>
          Boolean(str && str.toLowerCase().includes(searchLower))

        // Search in meme text (memeText field + legacy topText/bottomText)
        const matchesMemeText = includes(meme.memeText)
        const matchesTopText = includes(meme.topText)
        const matchesBottomText = includes(meme.bottomText)

        // Search in metadata
        const matchesDescription = includes(meme.description)
        const matchesLocation = meme.location
          ? (typeof meme.location === 'string'
              ? includes(meme.location)
              : includes(meme.location.display_name))
          : false
        const matchesUsername = includes(meme.username)
        const matchesTags = Array.isArray(meme.tags) && meme.tags.some(tag => includes(tag))

        return matchesMemeText || matchesTopText || matchesBottomText || matchesDescription ||
               matchesLocation || matchesUsername || matchesTags
      })
    }

    // Sort
    const sorted = [...filtered]
    switch (sortBy) {
      case 'recent':
        sorted.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        break
      case 'popular':
        sorted.sort((a, b) => b.likes - a.likes)
        break
      case 'oldest':
        sorted.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        break
    }

    return sorted
  }, [memes, selectedTags, searchQuery, sortBy])

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    )
  }

  const handleClearFilters = () => {
    setSelectedTags([])
    setSearchQuery('')
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <LoadingState message="טוען גיחוכים..." />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              אופס! משהו השתבש
            </h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              רענן את הדף
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            גלריית הגיחוכים
          </h1>
          <p className="text-lg text-gray-600">
            {filteredAndSortedMemes.length} מתוך {memes.length} גיחוכים
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="space-y-6">
            {/* Unified Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Search className="inline ml-2 h-5 w-5" />
                חיפוש בגלריה
              </label>
              <p className="text-xs text-gray-500 mb-3">
                חפשו לפי טקסט על הממ, תיאור, תגיות, מיקום או שם משתמש
              </p>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חיפוש..."
                  className="w-full pr-10 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-gray-600 mt-2">
                  נמצאו {filteredAndSortedMemes.length} תוצאות
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              {/* Tag Filters */}
              <FilterBar
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                onClearFilters={handleClearFilters}
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              {/* Sort Controls */}
              <SortControls
                currentSort={sortBy}
                onSortChange={setSortBy}
              />
            </div>
          </div>
        </div>

        {/* Meme Grid */}
        <MemeGrid memes={filteredAndSortedMemes} initialMemeId={initialMemeId} />
      </div>
    </Layout>
  )
}
