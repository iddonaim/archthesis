/**
 * Vercel serverless function: GET /api/fetch-memes
 *
 * Reads memes from archthesis Firestore and returns them as JSON.
 * Supports pagination, tag filtering, sorting, and text search.
 *
 * Drop this file into cuboid-studio/api/fetch-memes.ts
 *
 * Query parameters:
 *   ?limit=20        Number of memes to return (default 20, max 100)
 *   ?offset=0        Skip N memes for pagination
 *   ?tag=architecture Filter by tag
 *   ?sort=recent     Sort by: recent (default), popular, oldest
 *   ?search=tel+aviv  Text search across all fields
 *
 * Environment variables required:
 *   ARCHTHESIS_FIREBASE_SERVICE_ACCOUNT  (JSON string of service account key)
 *   ARCHTHESIS_FIREBASE_PROJECT_ID       (defaults to adaptivememeticarchitect-2776f)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getArchthesisDb } from '../lib/archthesis-firebase'
import type { ArchthesisMeme } from '../types/archthesis'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // CORS headers (adjust origin for production)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')

  try {
    const db = getArchthesisDb()

    // Parse query parameters
    const limit = Math.min(Number(req.query.limit) || 20, 100)
    const offset = Number(req.query.offset) || 0
    const tag = req.query.tag as string | undefined
    const sort = (req.query.sort as string) || 'recent'
    const search = (req.query.search as string)?.toLowerCase().trim()

    // Build Firestore query
    // We fetch all non-hidden memes and apply filtering/sorting in memory
    // because Firestore doesn't support full-text search natively.
    // For a small-to-medium collection this is fine; for scale, consider Algolia/Typesense.
    const snapshot = await db
      .collection('memes')
      .orderBy('createdAt', 'desc')
      .get()

    let memes: ArchthesisMeme[] = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        imageUrl: data.imageUrl || '',
        topText: data.topText || '',
        bottomText: data.bottomText || '',
        memeText: data.memeText || undefined,
        description: data.description || undefined,
        tags: data.tags || [],
        location: data.location || undefined,
        username: data.username || undefined,
        likes: data.likes || 0,
        timestamp: data.timestamp?.toDate?.() || new Date(data.createdAt || 0),
        createdAt: data.createdAt || undefined,
        hidden: data.hidden || false,
        originSource: data.originSource || undefined,
      }
    })

    // Filter out hidden memes
    memes = memes.filter(m => !m.hidden)

    // Filter by tag
    if (tag) {
      memes = memes.filter(m => m.tags.includes(tag))
    }

    // Text search (same logic as archthesis gallery)
    if (search) {
      memes = memes.filter(m => {
        const includes = (str?: string | null) =>
          Boolean(str && str.toLowerCase().includes(search))

        return (
          includes(m.memeText) ||
          includes(m.topText) ||
          includes(m.bottomText) ||
          includes(m.description) ||
          includes(m.username) ||
          (typeof m.location === 'string'
            ? includes(m.location)
            : includes(m.location?.display_name)) ||
          m.tags.some(t => includes(t))
        )
      })
    }

    // Sort
    switch (sort) {
      case 'popular':
        memes.sort((a, b) => b.likes - a.likes)
        break
      case 'oldest':
        memes.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        break
      case 'recent':
      default:
        // Already ordered by createdAt desc from Firestore
        break
    }

    const total = memes.length

    // Paginate
    memes = memes.slice(offset, offset + limit)

    // Serialize timestamps to ISO strings for JSON
    const serialized = memes.map(m => ({
      ...m,
      timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
    }))

    return res.status(200).json({ memes: serialized, total })
  } catch (error) {
    console.error('Error fetching archthesis memes:', error)
    return res.status(500).json({ error: 'Failed to fetch memes' })
  }
}
