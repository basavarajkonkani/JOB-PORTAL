import { render, screen } from '@testing-library/react'
import SignInHero from '../SignInHero'

describe('SignInHero Component', () => {
  it('renders all required elements correctly', () => {
    render(<SignInHero />)

    // Platform Badge
    expect(screen.getByText(/India's #1 AI-Powered early talent hiring platform/i)).toBeInTheDocument()

    // Main Heading
    expect(screen.getByText(/Hire Interns and Freshers/i)).toBeInTheDocument()
    expect(screen.getByText(/Faster/i)).toBeInTheDocument()

    // Bullet Points
    expect(screen.getByText(/Reduce hiring time by 50% with AI-Powered Tools/i)).toBeInTheDocument()
    expect(screen.getByText(/Get applicants from top colleges across India/i)).toBeInTheDocument()

    // Statistics
    expect(screen.getByText('32 Mn+')).toBeInTheDocument()
    expect(screen.getByText('Candidates')).toBeInTheDocument()
    expect(screen.getByText('100 K+')).toBeInTheDocument()
    expect(screen.getByText('Companies')).toBeInTheDocument()
    expect(screen.getByText('900+')).toBeInTheDocument()
    expect(screen.getByText('Cities')).toBeInTheDocument()

    // Rating
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText(/Rated by 2,448 users as on 6th October 2025/i)).toBeInTheDocument()
  })

  it('has proper ARIA labels for accessibility', () => {
    render(<SignInHero />)

    expect(screen.getByRole('complementary', { name: /platform information and statistics/i })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: /platform benefits/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /platform statistics/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /user ratings/i })).toBeInTheDocument()
  })

  it('renders hero image with correct attributes', () => {
    render(<SignInHero />)

    const image = screen.getByAltText(/Professional using laptop for hiring/i)
    expect(image).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    const { container } = render(<SignInHero className="custom-class" />)
    const heroDiv = container.firstChild as HTMLElement
    expect(heroDiv).toHaveClass('custom-class')
  })

  it('has hidden class on mobile (lg:flex)', () => {
    const { container } = render(<SignInHero />)
    const heroDiv = container.firstChild as HTMLElement
    expect(heroDiv).toHaveClass('hidden')
    expect(heroDiv).toHaveClass('lg:flex')
  })

  it('displays correct gradient background classes', () => {
    const { container } = render(<SignInHero />)
    const heroDiv = container.firstChild as HTMLElement
    expect(heroDiv).toHaveClass('bg-gradient-to-br')
    expect(heroDiv).toHaveClass('from-blue-600')
    expect(heroDiv).toHaveClass('via-indigo-600')
    expect(heroDiv).toHaveClass('to-blue-700')
  })

  it('renders all five stars for rating (4 full + 1 half)', () => {
    const { container } = render(<SignInHero />)
    const starsContainer = screen.getByRole('img', { name: /4.5 out of 5 stars/i })
    expect(starsContainer).toBeInTheDocument()
  })

  it('renders check icons for bullet points', () => {
    render(<SignInHero />)
    const bulletList = screen.getByRole('list', { name: /platform benefits/i })
    expect(bulletList).toBeInTheDocument()
    expect(bulletList.querySelectorAll('li')).toHaveLength(2)
  })
})
