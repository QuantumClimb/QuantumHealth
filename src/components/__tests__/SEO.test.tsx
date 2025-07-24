import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import SEO from '@/components/SEO'

describe('SEO Component', () => {
  it('renders with default props', () => {
    render(<SEO />)
    
    // Check that the component renders without crashing
    expect(document.title).toBe('QUANTUM HEALTH - Advanced Healthcare Management Platform')
  })

  it('renders with custom title', () => {
    const customTitle = 'Custom Page Title'
    render(<SEO title={customTitle} />)
    
    expect(document.title).toBe(`${customTitle} | QUANTUM HEALTH`)
  })

  it('renders with custom description', () => {
    const customDescription = 'Custom page description'
    render(<SEO description={customDescription} />)
    
    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription).toHaveAttribute('content', customDescription)
  })

  it('renders with custom keywords', () => {
    const customKeywords = 'custom, keywords, test'
    render(<SEO keywords={customKeywords} />)
    
    const metaKeywords = document.querySelector('meta[name="keywords"]')
    expect(metaKeywords).toHaveAttribute('content', customKeywords)
  })

  it('renders Open Graph meta tags', () => {
    const customTitle = 'OG Title'
    const customDescription = 'OG Description'
    const customImage = '/test-image.jpg'
    
    render(
      <SEO 
        title={customTitle}
        description={customDescription}
        image={customImage}
      />
    )
    
    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDescription = document.querySelector('meta[property="og:description"]')
    const ogImage = document.querySelector('meta[property="og:image"]')
    
    expect(ogTitle).toHaveAttribute('content', `${customTitle} | QUANTUM HEALTH`)
    expect(ogDescription).toHaveAttribute('content', customDescription)
    expect(ogImage).toHaveAttribute('content', customImage)
  })

  it('renders Twitter Card meta tags', () => {
    const customTitle = 'Twitter Title'
    const customDescription = 'Twitter Description'
    
    render(
      <SEO 
        title={customTitle}
        description={customDescription}
      />
    )
    
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    const twitterDescription = document.querySelector('meta[name="twitter:description"]')
    
    expect(twitterTitle).toHaveAttribute('content', `${customTitle} | QUANTUM HEALTH`)
    expect(twitterDescription).toHaveAttribute('content', customDescription)
  })
}) 