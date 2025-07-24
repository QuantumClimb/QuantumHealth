import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import Layout from '@/components/Layout'

describe('Layout Component', () => {
  it('renders children content', () => {
    render(
      <Layout userRole="patient">
        <div data-testid="test-content">Test Content</div>
      </Layout>
    )
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders with correct structure', () => {
    render(
      <Layout userRole="patient">
        <div>Content</div>
      </Layout>
    )
    
    // Check if the layout has the expected structure
    const layout = screen.getByRole('main')
    expect(layout).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    render(
      <Layout userRole="patient">
        <div>Content</div>
      </Layout>
    )
    
    const layout = screen.getByRole('main')
    expect(layout).toHaveClass('flex-1', 'p-6', 'md:p-8', 'animate-fade-in')
  })

  it('renders navbar and sidebar for patient', () => {
    render(
      <Layout userRole="patient">
        <div>Content</div>
      </Layout>
    )
    
    // Check if navbar and sidebar are rendered
    expect(screen.getByText('QUANTUM HEALTH')).toBeInTheDocument()
  })

  it('renders navbar and sidebar for doctor', () => {
    render(
      <Layout userRole="doctor">
        <div>Content</div>
      </Layout>
    )
    
    // Check if navbar and sidebar are rendered
    expect(screen.getByText('QUANTUM HEALTH')).toBeInTheDocument()
  })
}) 