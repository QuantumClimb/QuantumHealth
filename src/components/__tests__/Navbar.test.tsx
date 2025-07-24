import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import Navbar from '@/components/Navbar'

// Mock the useNavigate hook
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Navbar Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders the QUANTUM HEALTH logo', () => {
    render(<Navbar userRole="patient" />)
    
    expect(screen.getByText('QUANTUM HEALTH')).toBeInTheDocument()
  })

  it('renders patient portal text for patient role', () => {
    render(<Navbar userRole="patient" />)
    
    expect(screen.getByText('Patient Portal')).toBeInTheDocument()
  })

  it('renders doctor portal text for doctor role', () => {
    render(<Navbar userRole="doctor" />)
    
    expect(screen.getByText('Doctor Portal')).toBeInTheDocument()
  })

  it('renders notification bell icon', () => {
    render(<Navbar userRole="patient" />)
    
    const bellIcon = screen.getByRole('button')
    expect(bellIcon).toBeInTheDocument()
  })

  it('renders user profile link', () => {
    render(<Navbar userRole="patient" />)
    
    const profileLink = screen.getByRole('link', { name: /patient portal/i })
    expect(profileLink).toBeInTheDocument()
    expect(profileLink).toHaveAttribute('href', '/patient/profile')
  })

  it('renders doctor profile link for doctor role', () => {
    render(<Navbar userRole="doctor" />)
    
    const profileLink = screen.getByRole('link', { name: /doctor portal/i })
    expect(profileLink).toBeInTheDocument()
    expect(profileLink).toHaveAttribute('href', '/doctor/profile')
  })

  it('applies correct styling classes', () => {
    render(<Navbar userRole="patient" />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('glass-card', 'shadow-sm', 'sticky', 'top-0', 'z-30')
  })

  it('has correct logo styling', () => {
    render(<Navbar userRole="patient" />)
    
    const logo = screen.getByText('QUANTUM HEALTH')
    expect(logo).toHaveClass('text-2xl', 'font-bold', 'bg-gradient-to-r')
  })
}) 