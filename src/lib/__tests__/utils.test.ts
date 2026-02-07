import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cn, debounce, formatTimestamp } from '../utils'

describe('cn (className utility)', () => {
  it('merges class names', () => {
    const result = cn('base-class', 'additional-class')
    expect(result).toContain('base-class')
    expect(result).toContain('additional-class')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const result = cn('base', isActive && 'active')
    expect(result).toContain('active')
  })

  it('handles falsy values', () => {
    const result = cn('base', false, null, undefined, 'valid')
    expect(result).toContain('base')
    expect(result).toContain('valid')
  })

  it('merges Tailwind conflicting classes correctly', () => {
    const result = cn('px-2', 'px-4')
    // Should only have one px class (the last one wins)
    expect(result).toBe('px-4')
  })
})

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('delays function execution', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 1000)

    debouncedFn()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('resets timer on subsequent calls', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 1000)

    debouncedFn()
    vi.advanceTimersByTime(500)
    debouncedFn()
    vi.advanceTimersByTime(500)

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('passes arguments to debounced function', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 1000)

    debouncedFn('arg1', 'arg2')
    vi.advanceTimersByTime(1000)

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('only executes once for multiple rapid calls', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 1000)

    debouncedFn()
    debouncedFn()
    debouncedFn()
    debouncedFn()

    vi.advanceTimersByTime(1000)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('formatTimestamp', () => {
  it('formats timestamp as "עכשיו" for recent dates', () => {
    const now = new Date()
    const result = formatTimestamp(now)
    expect(result).toBe('עכשיו')
  })

  it('formats timestamp as "לפני X דקות"', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const result = formatTimestamp(fiveMinutesAgo)
    expect(result).toBe('לפני 5 דקות')
  })

  it('formats timestamp as "לפני X שעות"', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000)
    const result = formatTimestamp(threeHoursAgo)
    expect(result).toBe('לפני 3 שעות')
  })

  it('formats timestamp as "לפני X ימים"', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    const result = formatTimestamp(threeDaysAgo)
    expect(result).toBe('לפני 3 ימים')
  })

  it('formats old dates as localized date string', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    const result = formatTimestamp(tenDaysAgo)
    // Should contain date format
    expect(result).toMatch(/\d+/)
  })
})
