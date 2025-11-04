import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignIn from '../SignIn'

// Mock dependencies
const mockSignIn = jest.fn()
const mockSignInWithGoogle = jest.fn()
const mockPush = jest.fn()
const mockTrackEvent = jest.fn()

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signInWithGoogle: mockSignInWithGoogle,
    user: null,
    loading: false,
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('@/lib/useAnalytics', () => ({
  useAnalytics: () => ({
    trackEvent: mockTrackEvent,
  }),
  EventType: {
    USER_SIGNED_IN: 'USER_SIGNED_IN',
  },
}))

describe('SignIn Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSignIn.mockReset()
    mockSignInWithGoogle.mockReset()
    mockPush.mockReset()
    mockTrackEvent.mockReset()
  })

  describe('Component Rendering', () => {
    it('renders split-screen layout with hero and form', () => {
      render(<SignIn />)

      // Check for form elements
      expect(screen.getByLabelText(/Official Email Id/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Mobile Number/i)).toBeInTheDocument()
    })

    it('renders Google sign-in button', () => {
      render(<SignIn />)
      expect(screen.getByRole('button', { name: /Sign up with Google/i })).toBeInTheDocument()
    })

    it('renders OR divider', () => {
      render(<SignIn />)
      expect(screen.getByText('OR')).toBeInTheDocument()
    })

    it('renders submit button with correct text', () => {
      render(<SignIn />)
      expect(screen.getByRole('button', { name: /Submit sign in form/i })).toBeInTheDocument()
      expect(screen.getByText('Post for Free')).toBeInTheDocument()
    })

    it('renders login link', () => {
      render(<SignIn />)
      expect(screen.getByRole('link', { name: /Go to login page/i })).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('requires email and password fields', () => {
      render(<SignIn />)

      const emailInput = screen.getByLabelText(/Official Email Id/i)
      const passwordInput = screen.getByLabelText(/^Password/i)

      expect(emailInput).toBeRequired()
      expect(passwordInput).toBeRequired()
    })

    it('accepts valid email format', async () => {
      const user = userEvent.setup()
      render(<SignIn />)

      const emailInput = screen.getByLabelText(/Official Email Id/i)
      await user.type(emailInput, 'test@example.com')

      expect(emailInput).toHaveValue('test@example.com')
    })

    it('accepts password input', async () => {
      const user = userEvent.setup()
      render(<SignIn />)

      const passwordInput = screen.getByLabelText(/^Password/i)
      await user.type(passwordInput, 'password123')

      expect(passwordInput).toHaveValue('password123')
    })

    it('accepts optional fields (firstName, lastName, mobile)', async () => {
      const user = userEvent.setup()
      render(<SignIn />)

      const firstNameInput = screen.getByLabelText(/First Name/i)
      const lastNameInput = screen.getByLabelText(/Last Name/i)
      const mobileInput = screen.getByLabelText(/Mobile Number/i)

      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')
      await user.type(mobileInput, '9876543210')

      expect(firstNameInput).toHaveValue('John')
      expect(lastNameInput).toHaveValue('Doe')
      expect(mobileInput).toHaveValue('9876543210')
    })
  })

  describe('Email/Password Authentication', () => {
    it('calls signIn with email and password on form submit', async () => {
      const user = userEvent.setup()
      mockSignIn.mockResolvedValue({})

      render(<SignIn />)

      await user.type(screen.getByLabelText(/Official Email Id/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^Password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /Submit sign in form/i }))

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('redirects to dashboard on successful sign in', async () => {
      const user = userEvent.setup()
      mockSignIn.mockResolvedValue({})

      render(<SignIn />)

      await user.type(screen.getByLabelText(/Official Email Id/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^Password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /Submit sign in form/i }))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('tracks sign in event on success', async () => {
      const user = userEvent.setup()
      mockSignIn.mockResolvedValue({})

      render(<SignIn />)

      await user.type(screen.getByLabelText(/Official Email Id/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^Password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /Submit sign in form/i }))

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalled()
      })
    })

    it('displays error message on sign in failure', async () => {
      const user = userEvent.setup()
      mockSignIn.mockRejectedValue(new Error('Invalid credentials'))

      render(<SignIn />)

      await user.type(screen.getByLabelText(/Official Email Id/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^Password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /Submit sign in form/i }))

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('does not redirect on sign in failure', async () => {
      const user = userEvent.setup()
      mockSignIn.mockRejectedValue(new Error('Invalid credentials'))

      render(<SignIn />)

      await user.type(screen.getByLabelText(/Official Email Id/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^Password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /Submit sign in form/i }))

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Google Sign-In', () => {
    it('calls signInWithGoogle when Google button is clicked', async () => {
      const user = userEvent.setup()
      mockSignInWithGoogle.mockResolvedValue({})

      render(<SignIn />)

      await user.click(screen.getByRole('button', { name: /Sign up with Google/i }))

      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalledWith('candidate')
      })
    })

    it('redirects to dashboard on successful Google sign in', async () => {
      const user = userEvent.setup()
      mockSignInWithGoogle.mockResolvedValue({})

      render(<SignIn />)

      await user.click(screen.getByRole('button', { name: /Sign up with Google/i }))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('tracks Google sign in event on success', async () => {
      const user = userEvent.setup()
      mockSignInWithGoogle.mockResolvedValue({})

      render(<SignIn />)

      await user.click(screen.getByRole('button', { name: /Sign up with Google/i }))

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalledWith({
          eventType: expect.any(String),
          properties: { method: 'google' },
        })
      })
    })

    it('displays error message on Google sign in failure', async () => {
      const user = userEvent.setup()
      mockSignInWithGoogle.mockRejectedValue(new Error('Google auth failed'))

      render(<SignIn />)

      await user.click(screen.getByRole('button', { name: /Sign up with Google/i }))

      await waitFor(() => {
        expect(screen.getByText('Google auth failed')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('shows loading state on submit button during sign in', async () => {
      const user = userEvent.setup()
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<SignIn />)

      await user.type(screen.getByLabelText(/Official Email Id/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^Password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /Submit sign in form/i }))

      expect(screen.getByText('Signing in...')).toBeInTheDocument()
    })

    it('shows loading state on Google button during Google sign in', async () => {
      const user = userEvent.setup()
      mockSignInWithGoogle.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<SignIn />)

      await user.click(screen.getByRole('button', { name: /Sign up with Google/i }))

      expect(screen.getByText('Signing in...')).toBeInTheDocument()
    })

    it('disables submit button during loading', async () => {
      const user = userEvent.setup()
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<SignIn />)

      await user.type(screen.getByLabelText(/Official Email Id/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^Password/i), 'password123')

      const submitButton = screen.getByRole('button', { name: /Submit sign in form/i })
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
    })

    it('disables Google button during loading', async () => {
      const user = userEvent.setup()
      mockSignInWithGoogle.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<SignIn />)

      const googleButton = screen.getByRole('button', { name: /Sign up with Google/i })
      await user.click(googleButton)

      expect(googleButton).toBeDisabled()
    })

    it('disables all inputs during email sign in', async () => {
      const user = userEvent.setup()
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<SignIn />)

      await user.type(screen.getByLabelText(/Official Email Id/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^Password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /Submit sign in form/i }))

      expect(screen.getByLabelText(/Official Email Id/i)).toBeDisabled()
      expect(screen.getByLabelText(/^Password/i)).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('displays error in alert box with proper styling', async () => {
      const user = userEvent.setup()
      mockSignIn.mockRejectedValue(new Error('Network error'))

      render(<SignIn />)

      await user.type(screen.getByLabelText(/Official Email Id/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^Password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /Submit sign in form/i }))

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert')
        expect(errorAlert).toBeInTheDocument()
        expect(errorAlert).toHaveTextContent('Network error')
      })
    })

    it('clears error when starting new sign in attempt', async () => {
      const user = userEvent.setup()
      mockSignIn.mockRejectedValueOnce(new Error('First error')).mockResolvedValueOnce({})

      render(<SignIn />)

      // First attempt - fail
      await user.type(screen.getByLabelText(/Official Email Id/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^Password/i), 'wrong')
      await user.click(screen.getByRole('button', { name: /Submit sign in form/i }))

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument()
      })

      // Second attempt - should clear error
      await user.clear(screen.getByLabelText(/^Password/i))
      await user.type(screen.getByLabelText(/^Password/i), 'correct')
      await user.click(screen.getByRole('button', { name: /Submit sign in form/i }))

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument()
      })
    })

    it('handles non-Error objects in catch block', async () => {
      const user = userEvent.setup()
      mockSignIn.mockRejectedValue('String error')

      render(<SignIn />)

      await user.type(screen.getByLabelText(/Official Email Id/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^Password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /Submit sign in form/i }))

      await waitFor(() => {
        expect(screen.getByText('Sign in failed')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels on form inputs', () => {
      render(<SignIn />)

      expect(screen.getByLabelText(/Official Email Id/i)).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText(/^Password/i)).toHaveAttribute('aria-required', 'true')
    })

    it('announces errors to screen readers', async () => {
      const user = userEvent.setup()
      mockSignIn.mockRejectedValue(new Error('Test error'))

      render(<SignIn />)

      await user.type(screen.getByLabelText(/Official Email Id/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^Password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /Submit sign in form/i }))

      await waitFor(() => {
        const alert = screen.getByRole('alert')
        expect(alert).toHaveAttribute('aria-live', 'assertive')
        expect(alert).toHaveAttribute('aria-atomic', 'true')
      })
    })

    it('supports keyboard navigation with Tab', () => {
      render(<SignIn />)

      const googleButton = screen.getByRole('button', { name: /Sign up with Google/i })
      const emailInput = screen.getByLabelText(/Official Email Id/i)
      const passwordInput = screen.getByLabelText(/^Password/i)

      expect(googleButton).toHaveAttribute('tabIndex', '0')
      expect(emailInput).toHaveAttribute('tabIndex', '0')
      expect(passwordInput).toHaveAttribute('tabIndex', '0')
    })

    it('allows form submission with Enter key', async () => {
      const user = userEvent.setup()
      mockSignIn.mockResolvedValue({})

      render(<SignIn />)

      const emailInput = screen.getByLabelText(/Official Email Id/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(screen.getByLabelText(/^Password/i), 'password123')
      await user.type(emailInput, '{Enter}')

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled()
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('renders grid layout for split-screen', () => {
      const { container } = render(<SignIn />)
      const gridContainer = container.firstChild as HTMLElement
      expect(gridContainer).toHaveClass('grid')
      expect(gridContainer).toHaveClass('lg:grid-cols-2')
    })

    it('has minimum height for full viewport', () => {
      const { container } = render(<SignIn />)
      const gridContainer = container.firstChild as HTMLElement
      expect(gridContainer).toHaveClass('min-h-screen')
    })

    it('has touch-friendly input heights (min-h-[44px])', () => {
      render(<SignIn />)

      const emailInput = screen.getByLabelText(/Official Email Id/i)
      expect(emailInput).toHaveClass('min-h-[44px]')
    })
  })
})
