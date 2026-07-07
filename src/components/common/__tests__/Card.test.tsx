import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import Card, { CardHeader, CardContent, CardFooter } from '../Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies hover styles when hover prop is true', () => {
    render(<Card hover>Hoverable card</Card>)
    const card = screen.getByText('Hoverable card')
    expect(card).toHaveClass('hover:shadow-card-hover')
    expect(card).toHaveClass('cursor-pointer')
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Card onClick={handleClick}>Clickable card</Card>)

    await user.click(screen.getByText('Clickable card'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    render(<Card className="custom-class">Card</Card>)
    const card = screen.getByText('Card')
    expect(card).toHaveClass('custom-class')
  })

  it('applies different padding variants', () => {
    const { rerender } = render(<Card padding="sm">Small padding</Card>)
    let card = screen.getByText('Small padding')
    expect(card).toHaveClass('p-3')

    rerender(<Card padding="md">Medium padding</Card>)
    card = screen.getByText('Medium padding')
    expect(card).toHaveClass('p-6')

    rerender(<Card padding="lg">Large padding</Card>)
    card = screen.getByText('Large padding')
    expect(card).toHaveClass('p-8')

    rerender(<Card padding="none">No padding</Card>)
    card = screen.getByText('No padding')
    expect(card.className).not.toMatch(/\bp-\d/)
  })
})

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header content</CardHeader>)
    expect(screen.getByText('Header content')).toBeInTheDocument()
  })

  it('applies default styles', () => {
    render(<CardHeader>Header</CardHeader>)
    const header = screen.getByText('Header')
    expect(header).toHaveClass('mb-4')
  })
})

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Content text</CardContent>)
    expect(screen.getByText('Content text')).toBeInTheDocument()
  })

  it('applies text color style', () => {
    render(<CardContent>Content</CardContent>)
    const content = screen.getByText('Content')
    expect(content).toHaveClass('text-gray-600')
  })
})

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer content</CardFooter>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('applies border-top style', () => {
    render(<CardFooter>Footer</CardFooter>)
    const footer = screen.getByText('Footer')
    expect(footer).toHaveClass('border-t')
  })
})
