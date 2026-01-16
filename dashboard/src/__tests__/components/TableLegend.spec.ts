import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TableLegend from '@/components/TableLegend.vue'

describe('TableLegend', () => {
  const expectedLegendItems = [
    { label: 'Available', colorClass: 'bg-slate-700' },
    { label: 'Selected', colorClass: 'bg-sky-400/40' },
    { label: 'Reserved', colorClass: 'bg-slate-700/50' },
    { label: 'Your Reservation', colorClass: 'bg-violet-400/40' },
    { label: 'Seated', colorClass: 'bg-emerald-400/40' },
    { label: 'Cleaning', colorClass: 'bg-amber-400/40' },
  ]

  it('renders all 6 legend items', () => {
    const wrapper = mount(TableLegend)
    const items = wrapper.findAll('.flex.items-center.gap-2')
    expect(items).toHaveLength(6)
  })

  it('renders all status labels', () => {
    const wrapper = mount(TableLegend)
    expectedLegendItems.forEach((item) => {
      expect(wrapper.text()).toContain(item.label)
    })
  })

  it('renders Available with correct color class', () => {
    const wrapper = mount(TableLegend)
    const availableItem = wrapper.findAll('.flex.items-center.gap-2')[0]
    const colorIndicator = availableItem.find('span.w-3')
    expect(colorIndicator.classes()).toContain('bg-slate-700')
  })

  it('renders Selected with correct color class', () => {
    const wrapper = mount(TableLegend)
    const selectedItem = wrapper.findAll('.flex.items-center.gap-2')[1]
    const colorIndicator = selectedItem.find('span.w-3')
    expect(colorIndicator.classes()).toContain('bg-sky-400/40')
  })

  it('renders Reserved with correct color class', () => {
    const wrapper = mount(TableLegend)
    const reservedItem = wrapper.findAll('.flex.items-center.gap-2')[2]
    const colorIndicator = reservedItem.find('span.w-3')
    expect(colorIndicator.classes()).toContain('bg-slate-700/50')
  })

  it('renders Your Reservation with correct color class', () => {
    const wrapper = mount(TableLegend)
    const ownItem = wrapper.findAll('.flex.items-center.gap-2')[3]
    const colorIndicator = ownItem.find('span.w-3')
    expect(colorIndicator.classes()).toContain('bg-violet-400/40')
  })

  it('renders Seated with correct color class', () => {
    const wrapper = mount(TableLegend)
    const seatedItem = wrapper.findAll('.flex.items-center.gap-2')[4]
    const colorIndicator = seatedItem.find('span.w-3')
    expect(colorIndicator.classes()).toContain('bg-emerald-400/40')
  })

  it('renders Cleaning with correct color class', () => {
    const wrapper = mount(TableLegend)
    const cleaningItem = wrapper.findAll('.flex.items-center.gap-2')[5]
    const colorIndicator = cleaningItem.find('span.w-3')
    expect(colorIndicator.classes()).toContain('bg-amber-400/40')
  })

  it('renders color indicators with rounded corners', () => {
    const wrapper = mount(TableLegend)
    const colorIndicators = wrapper.findAll('span.w-3')
    colorIndicators.forEach((indicator) => {
      expect(indicator.classes()).toContain('rounded')
    })
  })
})
