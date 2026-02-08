/**
 * Types for archthesis meme data as stored in Firestore.
 * Collection: "memes" in project adaptivememeticarchitect-2776f
 */

export interface ArchthesisMeme {
  id: string
  imageUrl: string
  topText: string
  bottomText: string
  memeText?: string       // Combined searchable text from all text boxes
  description?: string
  tags: string[]
  location?: string | {   // Supports both legacy string and current object format
    latitude: number
    longitude: number
    display_name: string
    showInGallery?: boolean
    hideFromGallery?: boolean
  }
  username?: string
  likes: number
  timestamp: Date
  createdAt?: string      // ISO string
  hidden?: boolean
  originSource?: string   // QR code origin tracking
}

/**
 * The shape cuboid-studio's translateMeme API already expects.
 * This is what the meme picker should produce.
 */
export interface CuboidMemeInput {
  memeDescription: string
  locationTag: string
  engagementLevel: number
}

/**
 * Response shape from the fetch-memes API endpoint.
 */
export interface FetchMemesResponse {
  memes: ArchthesisMeme[]
  total: number
}

/**
 * Query parameters for the fetch-memes API endpoint.
 */
export interface FetchMemesParams {
  limit?: number          // Default 20, max 100
  offset?: number         // For pagination
  tag?: string            // Filter by tag
  sort?: 'recent' | 'popular' | 'oldest'
  search?: string         // Text search
}
