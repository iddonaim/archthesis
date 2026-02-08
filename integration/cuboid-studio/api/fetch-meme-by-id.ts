/**
 * Vercel serverless function: GET /api/fetch-meme-by-id?id=<memeDocId>
 *
 * Fetches a single meme from archthesis Firestore by document ID
 * and returns it pre-mapped to cuboid-studio's translateMeme input format.
 *
 * Drop this file into cuboid-studio/api/fetch-meme-by-id.ts
 *
 * Returns both the raw meme data and the mapped cuboid input:
 * {
 *   meme: { id, imageUrl, topText, ... },
 *   cuboidInput: { memeDescription, locationTag, engagementLevel }
 * }
 *
 * Environment variables required:
 *   ARCHTHESIS_FIREBASE_SERVICE_ACCOUNT
 *   ARCHTHESIS_FIREBASE_PROJECT_ID
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getArchthesisDb } from '../lib/archthesis-firebase'
import { mapMemeToCuboidInput } from '../lib/meme-mapper'
import type { ArchthesisMeme } from '../types/archthesis'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')

  const id = req.query.id as string
  if (!id) {
    return res.status(400).json({ error: 'Missing required parameter: id' })
  }

  try {
    const db = getArchthesisDb()
    const doc = await db.collection('memes').doc(id).get()

    if (!doc.exists) {
      return res.status(404).json({ error: 'Meme not found' })
    }

    const data = doc.data()!
    const meme: ArchthesisMeme = {
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

    if (meme.hidden) {
      return res.status(404).json({ error: 'Meme not found' })
    }

    const cuboidInput = mapMemeToCuboidInput(meme)

    return res.status(200).json({
      meme: {
        ...meme,
        timestamp: meme.timestamp instanceof Date ? meme.timestamp.toISOString() : meme.timestamp,
      },
      cuboidInput,
    })
  } catch (error) {
    console.error('Error fetching archthesis meme:', error)
    return res.status(500).json({ error: 'Failed to fetch meme' })
  }
}
