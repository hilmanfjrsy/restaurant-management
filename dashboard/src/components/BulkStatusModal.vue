<script setup lang="ts">
import type { TableStatus } from '@/types/table'

const props = defineProps<{
  isOpen: boolean
  selectedCount: number
}>()

const emit = defineEmits<{
  close: []
  'change-status': [status: TableStatus]
}>()

const statuses: { value: TableStatus; label: string; colorClass: string }[] = [
  { value: 'available', label: 'Available', colorClass: 'border-green-500 text-green-500 hover:bg-green-500' },
  { value: 'seated', label: 'Seated', colorClass: 'border-red-500 text-red-500 hover:bg-red-500' },
  { value: 'reserved', label: 'Reserved', colorClass: 'border-amber-500 text-amber-500 hover:bg-amber-500' },
  { value: 'cleaning', label: 'Cleaning', colorClass: 'border-yellow-500 text-yellow-500 hover:bg-yellow-500' },
]

function handleStatusChange(status: TableStatus) {
  emit('change-status', status)
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-1000 p-4"
    @click.self="handleClose"
  >
    <div class="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-sm shadow-2xl">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">
          Change Status
        </h2>
        <button
          class="text-3xl text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 leading-none transition-colors"
          type="button"
          @click="handleClose"
        >
          &times;
        </button>
      </div>

      <!-- Description -->
      <p class="text-gray-600 dark:text-gray-400 text-sm mb-6">
        Change status for <strong class="text-gray-800 dark:text-gray-100">{{ selectedCount }}</strong> selected table{{ selectedCount > 1 ? 's' : '' }}
      </p>

      <!-- Status Options -->
      <div class="grid grid-cols-2 gap-3 mb-6">
        <button
          v-for="status in statuses"
          :key="status.value"
          :class="[
            'p-4 border-2 rounded-lg font-semibold text-sm cursor-pointer transition-all hover:text-white',
            status.colorClass
          ]"
          type="button"
          @click="handleStatusChange(status.value)"
        >
          {{ status.label }}
        </button>
      </div>

      <!-- Actions -->
      <div class="flex justify-end">
        <button
          class="px-6 py-3 rounded-lg font-semibold text-sm transition-all border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          type="button"
          @click="handleClose"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
