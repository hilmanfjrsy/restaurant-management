import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TableSection from '@/components/TableSection.vue'
import TableCell from '@/components/TableCell.vue'
import type { ITable } from '@/types/table'

describe('TableSection', () => {
  const createTable = (id: string, number: string): ITable => ({
    id,
    number,
    capacity: 4,
    location: 'indoor',
    status: 'available',
    reservation: null,
  })

  const mockTables: ITable[] = [
    createTable('1', 'T1'),
    createTable('2', 'T2'),
    createTable('3', 'T3'),
  ]

  const defaultProps = {
    title: 'Indoor',
    tables: mockTables,
    selectedTableIds: [] as string[],
    selectionMode: 'reserve' as const,
    currentCustomerId: null,
  }

  describe('rendering', () => {
    it('renders section title', () => {
      const wrapper = mount(TableSection, { props: defaultProps })
      expect(wrapper.text()).toContain('Indoor')
    })

    it('renders correct number of TableCell components', () => {
      const wrapper = mount(TableSection, { props: defaultProps })
      const tableCells = wrapper.findAllComponents(TableCell)
      expect(tableCells).toHaveLength(3)
    })

    it('renders no TableCells when tables array is empty', () => {
      const wrapper = mount(TableSection, {
        props: { ...defaultProps, tables: [] },
      })
      const tableCells = wrapper.findAllComponents(TableCell)
      expect(tableCells).toHaveLength(0)
    })
  })

  describe('props passing', () => {
    it('passes table data to TableCell', () => {
      const wrapper = mount(TableSection, { props: defaultProps })
      const firstCell = wrapper.findComponent(TableCell)
      expect(firstCell.props('table')).toEqual(mockTables[0])
    })

    it('passes selectionMode to TableCell', () => {
      const wrapper = mount(TableSection, {
        props: { ...defaultProps, selectionMode: 'status' },
      })
      const firstCell = wrapper.findComponent(TableCell)
      expect(firstCell.props('selectionMode')).toBe('status')
    })

    it('passes currentCustomerId to TableCell', () => {
      const wrapper = mount(TableSection, {
        props: { ...defaultProps, currentCustomerId: 'customer-1' },
      })
      const firstCell = wrapper.findComponent(TableCell)
      expect(firstCell.props('currentCustomerId')).toBe('customer-1')
    })

    it('passes isSelected correctly when table is selected', () => {
      const wrapper = mount(TableSection, {
        props: { ...defaultProps, selectedTableIds: ['1', '3'] },
      })
      const tableCells = wrapper.findAllComponents(TableCell)
      expect(tableCells[0].props('isSelected')).toBe(true)
      expect(tableCells[1].props('isSelected')).toBe(false)
      expect(tableCells[2].props('isSelected')).toBe(true)
    })
  })

  describe('events', () => {
    it('emits select-table event when TableCell is clicked', async () => {
      const wrapper = mount(TableSection, { props: defaultProps })
      const firstCell = wrapper.findComponent(TableCell)
      await firstCell.trigger('click')
      expect(wrapper.emitted('select-table')).toBeTruthy()
      expect(wrapper.emitted('select-table')![0]).toEqual([mockTables[0]])
    })

    it('emits correct table data for each clicked cell', async () => {
      const wrapper = mount(TableSection, { props: defaultProps })
      const tableCells = wrapper.findAllComponents(TableCell)

      await tableCells[0].trigger('click')
      await tableCells[2].trigger('click')

      const emittedEvents = wrapper.emitted('select-table')!
      expect(emittedEvents).toHaveLength(2)
      expect(emittedEvents[0]).toEqual([mockTables[0]])
      expect(emittedEvents[1]).toEqual([mockTables[2]])
    })
  })

  describe('isSelected helper', () => {
    it('correctly identifies selected tables', () => {
      const wrapper = mount(TableSection, {
        props: { ...defaultProps, selectedTableIds: ['2'] },
      })
      const tableCells = wrapper.findAllComponents(TableCell)
      expect(tableCells[0].props('isSelected')).toBe(false)
      expect(tableCells[1].props('isSelected')).toBe(true)
      expect(tableCells[2].props('isSelected')).toBe(false)
    })
  })
})
