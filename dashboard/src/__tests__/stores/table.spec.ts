import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTableUIStore } from '@/stores/table'

describe('useTableUIStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('toggleSelection', () => {
    it('adds table ID to selection when not selected', () => {
      const store = useTableUIStore()
      store.toggleSelection('table-1')
      expect(store.selectedTableIds).toContain('table-1')
    })

    it('removes table ID from selection when already selected', () => {
      const store = useTableUIStore()
      store.toggleSelection('table-1')
      store.toggleSelection('table-1')
      expect(store.selectedTableIds).not.toContain('table-1')
    })

    it('can select multiple tables', () => {
      const store = useTableUIStore()
      store.toggleSelection('table-1')
      store.toggleSelection('table-2')
      store.toggleSelection('table-3')
      expect(store.selectedTableIds).toHaveLength(3)
      expect(store.selectedTableIds).toEqual(['table-1', 'table-2', 'table-3'])
    })
  })

  describe('clearSelection', () => {
    it('clears all selected table IDs', () => {
      const store = useTableUIStore()
      store.toggleSelection('table-1')
      store.toggleSelection('table-2')
      store.clearSelection()
      expect(store.selectedTableIds).toHaveLength(0)
    })
  })

  describe('selectAll', () => {
    it('selects all provided table IDs', () => {
      const store = useTableUIStore()
      const tableIds = ['table-1', 'table-2', 'table-3']
      store.selectAll(tableIds)
      expect(store.selectedTableIds).toEqual(tableIds)
    })

    it('replaces existing selection', () => {
      const store = useTableUIStore()
      store.toggleSelection('table-old')
      store.selectAll(['table-1', 'table-2'])
      expect(store.selectedTableIds).toEqual(['table-1', 'table-2'])
      expect(store.selectedTableIds).not.toContain('table-old')
    })
  })

  describe('setSelectionMode', () => {
    it('sets selection mode to reserve', () => {
      const store = useTableUIStore()
      store.setSelectionMode('reserve')
      expect(store.selectionMode).toBe('reserve')
    })

    it('sets selection mode to status', () => {
      const store = useTableUIStore()
      store.setSelectionMode('reserve')
      store.setSelectionMode('status')
      expect(store.selectionMode).toBe('status')
    })

    it('clears selection when changing mode', () => {
      const store = useTableUIStore()
      store.toggleSelection('table-1')
      store.setSelectionMode('reserve')
      expect(store.selectedTableIds).toHaveLength(0)
    })
  })

  describe('isSelected', () => {
    it('returns true for selected table', () => {
      const store = useTableUIStore()
      store.toggleSelection('table-1')
      expect(store.isSelected('table-1')).toBe(true)
    })

    it('returns false for unselected table', () => {
      const store = useTableUIStore()
      expect(store.isSelected('table-1')).toBe(false)
    })
  })

  describe('initial state', () => {
    it('starts with empty selection', () => {
      const store = useTableUIStore()
      expect(store.selectedTableIds).toHaveLength(0)
    })

    it('starts with status selection mode', () => {
      const store = useTableUIStore()
      expect(store.selectionMode).toBe('status')
    })
  })
})
