import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import AdminLoginPage from '@/pages/AdminLoginPage'
import { signInWithEmailAndPassword } from 'firebase/auth'

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null) // No user logged in initially
    return vi.fn() // Unsubscribe function
  }),
  getAuth: vi.fn(() => ({})),
  signOut: vi.fn()
}))

// Mock router
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  }
})

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('Admin Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    render(<AdminLoginPage />)

    expect(screen.getByText(/כניסה לפאנל הניהול/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/אימייל/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/סיסמה/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /התחבר/i })).toBeInTheDocument()
  })

  it('shows validation for empty fields', async () => {
    const user = userEvent.setup()
    render(<AdminLoginPage />)

    const submitButton = screen.getByRole('button', { name: /התחבר/i })
    await user.click(submitButton)

    // HTML5 validation should prevent submission
    const emailInput = screen.getByLabelText(/אימייל/i)
    expect(emailInput).toBeRequired()
  })

  it('handles successful login', async () => {
    const user = userEvent.setup()

    // Mock successful login
    vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({
      user: {
        email: 'admin@test.com',
        uid: 'test-uid'
      }
    } as any)

    render(<AdminLoginPage />)

    // Fill in the form
    await user.type(screen.getByLabelText(/אימייל/i), 'admin@test.com')
    await user.type(screen.getByLabelText(/סיסמה/i), 'password123')

    // Submit
    const submitButton = screen.getByRole('button', { name: /התחבר/i })
    await user.click(submitButton)

    // Wait for login to complete
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'admin@test.com',
        'password123'
      )
    })
  })

  it('displays error message on failed login', async () => {
    const user = userEvent.setup()

    // Mock failed login
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce({
      code: 'auth/invalid-credential'
    })

    render(<AdminLoginPage />)

    // Fill in the form with wrong credentials
    await user.type(screen.getByLabelText(/אימייל/i), 'wrong@test.com')
    await user.type(screen.getByLabelText(/סיסמה/i), 'wrongpassword')

    // Submit
    await user.click(screen.getByRole('button', { name: /התחבר/i }))

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/אימייל או סיסמה שגויים/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during login', async () => {
    const user = userEvent.setup()

    // Mock delayed login
    vi.mocked(signInWithEmailAndPassword).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    )

    render(<AdminLoginPage />)

    await user.type(screen.getByLabelText(/אימייל/i), 'admin@test.com')
    await user.type(screen.getByLabelText(/סיסמה/i), 'password123')
    await user.click(screen.getByRole('button', { name: /התחבר/i }))

    // Check for loading state
    expect(screen.getByRole('button', { name: /מתחבר/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /מתחבר/i })).toBeDisabled()
  })

  it('handles network errors', async () => {
    const user = userEvent.setup()

    // Mock network error
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce({
      code: 'auth/network-request-failed'
    })

    render(<AdminLoginPage />)

    await user.type(screen.getByLabelText(/אימייל/i), 'admin@test.com')
    await user.type(screen.getByLabelText(/סיסמה/i), 'password123')
    await user.click(screen.getByRole('button', { name: /התחבר/i }))

    await waitFor(() => {
      expect(screen.getByText(/בעיית חיבור לאינטרנט/i)).toBeInTheDocument()
    })
  })

  it('has link to home page', () => {
    render(<AdminLoginPage />)
    // The link text appears in more than one place; assert at least one exists
    expect(screen.getAllByText(/חזרה לדף הבית/i).length).toBeGreaterThan(0)
  })

  it('displays security notice', () => {
    render(<AdminLoginPage />)
    expect(screen.getByText(/דף זה מוגן ומיועד למנהלי המערכת בלבד/i)).toBeInTheDocument()
  })
})
