import { Timestamp } from 'firebase/firestore'

export interface FirestoreMeme {
  imageUrl: string
  topText: string
  bottomText: string
  tags: string[]
  location?: {
    latitude: number
    longitude: number
    display_name: string
  }
  likes: number
  timestamp: Timestamp
  userId?: string
}

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}
