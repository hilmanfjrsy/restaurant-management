import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TableCell from '@/components/TableCell.vue'
import type { ITable } from '@/types/table'

describe('TableCell', () => {
  const createTable = (overrides: Partial<ITable> = {}): ITable => ({
    id: '1',
    number: 'T1',
    capacity: 4,
    location: 'indoor',
    status: 'available',
    reservation: null,
    ...overrides,
  })

  const defaultProps = {
    table: createTable(),
    isSelected: false,
    selectionMode: 'reserve' as const,
    currentCustomerId: null,
  }

  describe('rendering', () => {
    it('renders table number', () => {
      const wrapper = mount(TableCell, { props: defaultProps })
      expect(wrapper.text()).toContain('T1')
    })

    it('renders table capacity', () => {
      const wrapper = mount(TableCell, { props: defaultProps })
      expect(wrapper.text()).toContain('4')
    })

    it('renders correct title attribute', () => {
      const wrapper = mount(TableCell, { props: defaultProps })
      expect(wrapper.attributes('title')).toBe('T1 - 4 seats')
    })
  })

  describe('status classes', () => {
    it('applies available status classes', () => {
      const wrapper = mount(TableCell, {
        props: { ...defaultProps, table: createTable({ status: 'available' }) },
      })
      expect(wrapper.classes()).toContain('bg-slate-800')
    })

    it('applies reserved status classes', () => {
      const wrapper = mount(TableCell, {
        props: { ...defaultProps, table: createTable({ status: 'reserved' }) },
      })
      expect(wrapper.classes()).toContain('bg-slate-800/40')
    })

    it('applies seated status classes', () => {
      const wrapper = mount(TableCell, {
        props: { ...defaultProps, table: createTable({ status: 'seated' }) },
      })
      expect(wrapper.classes()).toContain('bg-emerald-400/20')
    })

    it('applies cleaning status classes', () => {
      const wrapper = mount(TableCell, {
        props: { ...defaultProps, table: createTable({ status: 'cleaning' }) },
      })
      expect(wrapper.classes()).toContain('bg-amber-400/20')
    })

    it('applies selected classes when selected', () => {
      const wrapper = mount(TableCell, {
        props: { ...defaultProps, isSelected: true },
      })
      expect(wrapper.classes()).toContain('bg-sky-400/20')
    })

    it('applies own reservation classes', () => {
      const wrapper = mount(TableCell, {
        props: {
          ...defaultProps,
          currentCustomerId: 'customer-1',
          table: createTable({
            status: 'reserved',
            reservation: { id: 'res-1', customerId: 'customer-1', tableId: '1', date: '2024-01-01', startTime: '12:00', endTime: '14:00', partySize: 4 },
          }),
        },
      })
      expect(wrapper.classes()).toContain('bg-violet-400/20')
    })
  })

  describe('selectability', () => {
    it('is selectable when available in reserve mode', () => {
      const wrapper = mount(TableCell, {
        props: { ...defaultProps, selectionMode: 'reserve' },
      })
      expect(wrapper.classes()).toContain('cursor-pointer')
      expect(wrapper.attributes('disabled')).toBeUndefined()
    })

    it('is not selectable when reserved (not own) in reserve mode', () => {
      const wrapper = mount(TableCell, {
        props: {
          ...defaultProps,
          selectionMode: 'reserve',
          table: createTable({ status: 'reserved' }),
        },
      })
      expect(wrapper.classes()).toContain('cursor-not-allowed')
      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('is always selectable in status mode', () => {
      const wrapper = mount(TableCell, {
        props: {
          ...defaultProps,
          selectionMode: 'status',
          table: createTable({ status: 'reserved' }),
        },
      })
      expect(wrapper.classes()).toContain('cursor-pointer')
      expect(wrapper.attributes('disabled')).toBeUndefined()
    })

    it('is selectable for own reservation in reserve mode', () => {
      const wrapper = mount(TableCell, {
        props: {
          ...defaultProps,
          selectionMode: 'reserve',
          currentCustomerId: 'customer-1',
          table: createTable({
            status: 'reserved',
            reservation: { id: 'res-1', customerId: 'customer-1', tableId: '1', date: '2024-01-01', startTime: '12:00', endTime: '14:00', partySize: 4 },
          }),
        },
      })
      expect(wrapper.classes()).toContain('cursor-pointer')
    })
  })

  describe('click events', () => {
    it('emits click event with table when selectable', async () => {
      const wrapper = mount(TableCell, { props: defaultProps })
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')![0]).toEqual([defaultProps.table])
    })

    it('does not emit click event when not selectable', async () => {
      const wrapper = mount(TableCell, {
        props: {
          ...defaultProps,
          selectionMode: 'reserve',
          table: createTable({ status: 'reserved' }),
        },
      })
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })
})
