import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  type User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { resolveIsAdmin } from '@/lib/adminAccess'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [claims, setClaims] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser)

      // Pull the ID token's custom claims so `isAdmin` can honour the
      // `admin: true` claim that the security rules rely on. Failures here
      // (offline, revoked token) simply mean no claim-based admin — the email
      // allow-list still applies.
      if (nextUser) {
        try {
          const tokenResult = await nextUser.getIdTokenResult()
          setClaims(tokenResult.claims)
        } catch (error) {
          console.error('Failed to read auth token claims:', error)
          setClaims(null)
        }
      } else {
        setClaims(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const isAdmin = resolveIsAdmin(user, claims)

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    isAdmin,
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
