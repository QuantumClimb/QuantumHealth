import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import Login from '@/pages/Login'

// Mock the authService
vi.mock('@/services/authService', () => ({
  authService: {
    loginUser: vi.fn(),
    registerUser: vi.fn(),
    resetPassword: vi.fn(),
  },
}))

// Mock the useNavigate hook
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the QUANTUM HEALTH title', () => {
    render(<Login />)
    
    expect(screen.getByText('QUANTUM HEALTH')).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<Login />)
    
    expect(screen.getByText('Revolutionary healthcare management platform')).toBeInTheDocument()
  })

  it('renders patient and doctor tabs', () => {
    render(<Login />)
    
    expect(screen.getByText('Patient')).toBeInTheDocument()
    expect(screen.getByText('Doctor')).toBeInTheDocument()
  })

  it('switches between patient and doctor tabs', () => {
    render(<Login />)
    
    const doctorTab = screen.getByText('Doctor')
    fireEvent.click(doctorTab)
    
    // Check if doctor-specific content is shown
    expect(screen.getByText('Clinic ID')).toBeInTheDocument()
  })

  it('renders email and password fields for patient', () => {
    render(<Login />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders clinic ID field for doctor', () => {
    render(<Login />)
    
    const doctorTab = screen.getByText('Doctor')
    fireEvent.click(doctorTab)
    
    expect(screen.getByLabelText(/clinic id/i)).toBeInTheDocument()
  })

  it('shows password when toggle is clicked', () => {
    render(<Login />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    fireEvent.click(toggleButton)
    
    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('validates required fields', async () => {
    render(<Login />)
    
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(signInButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(signInButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('validates password length', async () => {
    render(<Login />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(passwordInput, { target: { value: '123' } })
    
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(signInButton)
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
  })

  it('validates clinic ID for doctor', async () => {
    render(<Login />)
    
    const doctorTab = screen.getByText('Doctor')
    fireEvent.click(doctorTab)
    
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(signInButton)
    
    await waitFor(() => {
      expect(screen.getByText(/clinic id is required/i)).toBeInTheDocument()
    })
  })

  it('shows demo login buttons', () => {
    render(<Login />)
    
    expect(screen.getByText(/continue as demo patient/i)).toBeInTheDocument()
    
    const doctorTab = screen.getByText('Doctor')
    fireEvent.click(doctorTab)
    
    expect(screen.getByText(/continue as demo doctor/i)).toBeInTheDocument()
  })

  it('handles demo patient login', () => {
    render(<Login />)
    
    const demoButton = screen.getByText(/continue as demo patient/i)
    fireEvent.click(demoButton)
    
    // Should navigate to patient dashboard
    expect(mockNavigate).toHaveBeenCalledWith('/patient/dashboard')
  })

  it('handles demo doctor login', () => {
    render(<Login />)
    
    const doctorTab = screen.getByText('Doctor')
    fireEvent.click(doctorTab)
    
    const demoButton = screen.getByText(/continue as demo doctor/i)
    fireEvent.click(demoButton)
    
    // Should navigate to doctor dashboard
    expect(mockNavigate).toHaveBeenCalledWith('/doctor/dashboard')
  })

  it('navigates to password reset page', () => {
    render(<Login />)
    
    const forgotPasswordLink = screen.getByText(/forgot your password/i)
    fireEvent.click(forgotPasswordLink)
    
    expect(mockNavigate).toHaveBeenCalledWith('/password-reset')
  })

  it('navigates to registration page', () => {
    render(<Login />)
    
    const registerLink = screen.getByText(/create new account/i)
    fireEvent.click(registerLink)
    
    expect(mockNavigate).toHaveBeenCalledWith('/register')
  })

  it('shows loading state during login', async () => {
    const { authService } = await import('@/services/authService')
    vi.mocked(authService.loginUser).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(signInButton)
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    expect(signInButton).toBeDisabled()
  })

  it('shows demo mode information', () => {
    render(<Login />)
    
    expect(screen.getByText(/demo mode/i)).toBeInTheDocument()
    expect(screen.getByText(/use the demo buttons above to explore/i)).toBeInTheDocument()
  })
}) 