import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useToast } from '@/composables/useToast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Clear toasts between tests
    const { toasts } = useToast()
    toasts.value = []
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('success', () => {
    it('adds a success toast', () => {
      const { toasts, success } = useToast()
      success('Success message')
      expect(toasts.value).toHaveLength(1)
      expect(toasts.value[0].type).toBe('success')
      expect(toasts.value[0].message).toBe('Success message')
    })
  })

  describe('error', () => {
    it('adds an error toast', () => {
      const { toasts, error } = useToast()
      error('Error message')
      expect(toasts.value).toHaveLength(1)
      expect(toasts.value[0].type).toBe('error')
      expect(toasts.value[0].message).toBe('Error message')
    })
  })

  describe('info', () => {
    it('adds an info toast', () => {
      const { toasts, info } = useToast()
      info('Info message')
      expect(toasts.value).toHaveLength(1)
      expect(toasts.value[0].type).toBe('info')
      expect(toasts.value[0].message).toBe('Info message')
    })
  })

  describe('showToast', () => {
    it('adds toast with default type info', () => {
      const { toasts, showToast } = useToast()
      showToast('Default message')
      expect(toasts.value[0].type).toBe('info')
    })

    it('assigns unique IDs to each toast', () => {
      const { toasts, success } = useToast()
      success('First')
      success('Second')
      expect(toasts.value[0].id).not.toBe(toasts.value[1].id)
    })
  })

  describe('removeToast', () => {
    it('removes toast by ID', () => {
      const { toasts, success, removeToast } = useToast()
      success('Test')
      const toastId = toasts.value[0].id
      removeToast(toastId)
      expect(toasts.value).toHaveLength(0)
    })

    it('does nothing when ID not found', () => {
      const { toasts, success, removeToast } = useToast()
      success('Test')
      removeToast(999)
      expect(toasts.value).toHaveLength(1)
    })
  })

  describe('auto-dismiss', () => {
    it('removes toast after 3 seconds', () => {
      const { toasts, success } = useToast()
      success('Test')
      expect(toasts.value).toHaveLength(1)
      vi.advanceTimersByTime(3000)
      expect(toasts.value).toHaveLength(0)
    })

    it('does not remove toast before 3 seconds', () => {
      const { toasts, success } = useToast()
      success('Test')
      vi.advanceTimersByTime(2999)
      expect(toasts.value).toHaveLength(1)
    })
  })

  describe('multiple toasts', () => {
    it('can have multiple toasts at once', () => {
      const { toasts, success, error, info } = useToast()
      success('Success')
      error('Error')
      info('Info')
      expect(toasts.value).toHaveLength(3)
    })

    it('removes toasts independently after their timeout', () => {
      const { toasts, success } = useToast()
      success('First')
      vi.advanceTimersByTime(1000)
      success('Second')
      vi.advanceTimersByTime(2000)
      // First toast should be removed (3000ms passed)
      expect(toasts.value).toHaveLength(1)
      expect(toasts.value[0].message).toBe('Second')
    })
  })
})
