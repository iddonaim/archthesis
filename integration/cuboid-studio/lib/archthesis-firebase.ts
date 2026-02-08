/**
 * Firebase Admin SDK setup for reading from archthesis Firestore.
 *
 * Used by the Vercel serverless function (api/fetch-memes.ts).
 * Requires a service account key stored as an environment variable.
 *
 * --- SETUP ---
 * 1. Go to Firebase Console > Project Settings > Service Accounts
 * 2. Click "Generate new private key" and download the JSON
 * 3. In your Vercel project settings, add an environment variable:
 *      ARCHTHESIS_FIREBASE_SERVICE_ACCOUNT = <paste the entire JSON as a string>
 * 4. Also add:
 *      ARCHTHESIS_FIREBASE_PROJECT_ID = adaptivememeticarchitect-2776f
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

const APP_NAME = 'archthesis'

let app: App
let db: Firestore

export function getArchthesisDb(): Firestore {
  if (db) return db

  // Check if already initialized (Vercel may reuse the process)
  const existing = getApps().find(a => a.name === APP_NAME)
  if (existing) {
    app = existing
  } else {
    const serviceAccount = JSON.parse(
      process.env.ARCHTHESIS_FIREBASE_SERVICE_ACCOUNT || '{}'
    )

    app = initializeApp(
      {
        credential: cert(serviceAccount),
        projectId: process.env.ARCHTHESIS_FIREBASE_PROJECT_ID || 'adaptivememeticarchitect-2776f',
      },
      APP_NAME
    )
  }

  db = getFirestore(app)
  return db
}
