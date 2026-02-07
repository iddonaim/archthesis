export interface Meme {
  id: string
  imageUrl: string
  topText: string
  bottomText: string
  memeText?: string // Combined searchable text from all text boxes
  description?: string
  tags: string[]
  location?: string | { // Support both old (string) and new (object) formats
    latitude: number
    longitude: number
    display_name: string
    showInGallery?: boolean
    hideFromGallery?: boolean
  }
  username?: string
  likes: number
  timestamp: Date
  userId?: string
  hidden?: boolean
  originSource?: string // QR code origin tracking (e.g., "florentin", "university", "link")
}

export interface MemeMetadata {
  topText: string
  bottomText: string
  tags: string[]
  location?: {
    latitude: number
    longitude: number
    display_name: string
    showInGallery?: boolean
    hideFromGallery?: boolean
  }
  username?: string
}
