import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import type { FirebaseConfig } from '@/types/firebase'

const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize App Check with reCAPTCHA v3.
// Currently in MONITORING MODE — collects data but does not block requests.
//
// To switch to ENFORCEMENT MODE (blocks unauthenticated API calls):
//   1. Confirm VITE_RECAPTCHA_SITE_KEY is set in your .env file.
//      The reCAPTCHA site key is public by design — safe to expose in frontend code.
//   2. Go to Firebase Console → App Check → Apps → archthesis (web)
//      and click "Enforce" for Firestore and Storage.
//   3. No code change needed here — enforcement is toggled in the Firebase Console only.
//
// Do NOT enforce before verifying the site key is working (check the App Check
// monitoring dashboard for successful token requests from real users first).
if (typeof window !== 'undefined') {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  })
}

// Initialize services
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)

export default app
