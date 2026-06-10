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

// Fail loudly — but visibly — if the build was produced without the Firebase
// environment variables. Without this guard, initializeApp() throws an opaque
// `auth/invalid-api-key` error at module load, React never mounts, and users
// get a blank white screen with no indication of the cause.
const REQUIRED_ENV: Record<keyof FirebaseConfig, string> = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID'
}

const missingEnv = (Object.keys(REQUIRED_ENV) as (keyof FirebaseConfig)[])
  .filter((key) => !firebaseConfig[key])
  .map((key) => REQUIRED_ENV[key])

if (missingEnv.length > 0) {
  const message =
    `Firebase is not configured: missing ${missingEnv.join(', ')}. ` +
    `This build was produced without the required environment variables — ` +
    `rebuild with a populated .env/.env.production and redeploy.`

  // Surface the problem in the page instead of leaving a blank white screen.
  if (typeof document !== 'undefined') {
    const root = document.getElementById('root')
    if (root) {
      root.innerHTML =
        '<div style="font-family:system-ui,sans-serif;max-width:640px;margin:15vh auto;padding:0 24px;text-align:center;color:#1f2937">' +
        '<h1 style="font-size:20px;margin-bottom:12px">Configuration error</h1>' +
        '<p style="color:#6b7280;line-height:1.6">The site could not start because its Firebase configuration is missing. ' +
        'If you are the site owner, rebuild and redeploy with the required environment variables set.</p>' +
        '</div>'
    }
  }

  throw new Error(message)
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
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
if (typeof window !== 'undefined' && recaptchaSiteKey) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true
  })
} else if (typeof window !== 'undefined') {
  // Don't pass an empty site key to reCAPTCHA — it throws "Missing required
  // parameters: sitekey" and breaks initialization. App Check stays disabled
  // until VITE_RECAPTCHA_SITE_KEY is provided.
  console.warn('App Check disabled: VITE_RECAPTCHA_SITE_KEY is not set.')
}

// Initialize services
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)

export default app
