<script setup lang="ts">
import { computed } from 'vue'
import type { ITable } from '@/types/table'

const props = defineProps<{
  table: ITable
  isSelected: boolean
  selectionMode: 'reserve' | 'status'
  currentCustomerId: string | null
}>()

const emit = defineEmits<{
  click: [table: ITable]
}>()

const isOwnReservation = computed(() => {
  if (!props.currentCustomerId) return false
  if (!props.table.reservation) return false
  return props.table.reservation.customerId === props.currentCustomerId
})

const isSelectable = computed(() => {
  if (props.selectionMode === 'status') return true
  return props.table.status === 'available' || isOwnReservation.value
})

const statusClasses = computed(() => {
  if (props.isSelected) {
    return 'bg-sky-400/20 text-sky-300 ring-1 ring-sky-400/50'
  }
  if (isOwnReservation.value) {
    return 'bg-violet-400/20 text-violet-300 ring-1 ring-violet-400/50'
  }
  switch (props.table.status) {
    case 'available':
      return 'bg-slate-800 text-slate-300 hover:bg-slate-700'
    case 'reserved':
      return 'bg-slate-800/40 text-slate-500'
    case 'seated':
      return 'bg-emerald-400/20 text-emerald-300'
    case 'cleaning':
      return 'bg-amber-400/20 text-amber-300'
    default:
      return 'bg-slate-800 text-slate-300'
  }
})

function handleClick() {
  if (isSelectable.value) {
    emit('click', props.table)
  }
}
</script>

<template>
  <button
    :class="[
      'w-16 h-16 rounded-lg text-xs',
      'flex flex-col items-center justify-center gap-1',
      'transition-all duration-150',
      statusClasses,
      { 'cursor-pointer': isSelectable },
      { 'cursor-not-allowed opacity-30': !isSelectable },
    ]"
    :disabled="!isSelectable"
    type="button"
    :title="`${table.number} - ${table.capacity} seats`"
    @click="handleClick"
  >
    <span class="font-semibold text-base">{{ table.number }}</span>
    <span class="flex items-center gap-1 text-[11px] opacity-60">
      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      {{ table.capacity }}
    </span>
  </button>
</template>
