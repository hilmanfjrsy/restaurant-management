<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { ITable, ICustomer, ReservationPayload } from '@/types/table'

const props = defineProps<{
  isOpen: boolean
  tables: ITable[]
  totalCapacity: number
  customer: ICustomer | null
  date: string
  time: string
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: ReservationPayload]
}>()

// Form fields
const totalPersons = ref(1)
const startTime = ref('')
const endTime = ref('')

// Computed: customer info is read-only when customer is provided
const customerName = computed(() => props.customer?.name ?? '')
const customerEmail = computed(() => props.customer?.email ?? '')
const customerPreference = computed(() => props.customer?.preference ?? '')

// Calculate default end time (2 hours after start)
function getDefaultEndTime(start: string): string {
  const parts = start.split(':').map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  const endHours = (hours + 2) % 24
  return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      totalPersons.value = 1
      startTime.value = props.time
      endTime.value = getDefaultEndTime(props.time)
    }
  }
)

// Update end time when start time changes
watch(startTime, (newStart) => {
  if (newStart) {
    endTime.value = getDefaultEndTime(newStart)
  }
})

function handleSubmit() {
  if (totalPersons.value < 1) return
  if (!startTime.value || !endTime.value) return

  emit('submit', {
    tableId: '',
    customerId: props.customer?.id ?? '',
    partySize: totalPersons.value,
    date: props.date,
    startTime: startTime.value,
    endTime: endTime.value,
  })
}

function handleClose() {
  emit('close')
}

function getTableNames(): string {
  return props.tables.map((t) => t.number).join(', ')
}
</script>

<template>
  <div
    v-if="isOpen && tables.length > 0"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-4"
    @click.self="handleClose"
  >
    <div class="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-5">
        <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">
          Make Reservation
        </h2>
        <button
          class="text-3xl text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 leading-none transition-colors"
          type="button"
          @click="handleClose"
        >
          &times;
        </button>
      </div>

      <!-- Table Summary -->
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-500 dark:text-gray-400">Tables:</span>
          <span class="font-semibold text-gray-800 dark:text-gray-100">{{ getTableNames() }}</span>
        </div>
        <div class="flex justify-between items-center text-sm mt-2">
          <span class="text-gray-500 dark:text-gray-400">Total Capacity:</span>
          <span class="font-semibold text-gray-800 dark:text-gray-100">{{ totalCapacity }} seats</span>
        </div>
        <div class="flex justify-between items-center text-sm mt-2">
          <span class="text-gray-500 dark:text-gray-400">Date:</span>
          <span class="font-semibold text-gray-800 dark:text-gray-100">{{ date }}</span>
        </div>
      </div>

      <!-- Form -->
      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <!-- Customer Name -->
        <div class="flex flex-col gap-2">
          <label for="customer-name" class="font-semibold text-sm text-gray-700 dark:text-gray-300">
            Customer Name
          </label>
          <input
            id="customer-name"
            :value="customerName"
            type="text"
            placeholder="Enter customer name"
            disabled
            class="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
          />
        </div>

        <!-- Customer Email -->
        <div class="flex flex-col gap-2">
          <label for="customer-email" class="font-semibold text-sm text-gray-700 dark:text-gray-300">
            Customer Email
          </label>
          <input
            id="customer-email"
            :value="customerEmail"
            type="email"
            placeholder="Enter customer email"
            disabled
            class="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
          />
        </div>

        <!-- Time Row -->
        <div class="grid grid-cols-2 sm:grid-cols-1 gap-4">
          <div class="flex flex-col gap-2">
            <label for="start-time" class="font-semibold text-sm text-gray-700 dark:text-gray-300">
              Start Time *
            </label>
            <input
              id="start-time"
              v-model="startTime"
              type="time"
              required
              class="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="end-time" class="font-semibold text-sm text-gray-700 dark:text-gray-300">
              End Time *
            </label>
            <input
              id="end-time"
              v-model="endTime"
              type="time"
              required
              class="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <!-- Total Persons -->
        <div class="flex flex-col gap-2">
          <label for="total-persons" class="font-semibold text-sm text-gray-700 dark:text-gray-300">
            Total Persons *
          </label>
          <input
            id="total-persons"
            v-model.number="totalPersons"
            type="number"
            min="1"
            :max="totalCapacity"
            placeholder="Number of guests"
            required
            class="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <span class="text-xs text-gray-500 dark:text-gray-400">
            Maximum {{ totalCapacity }} persons based on selected tables
          </span>
        </div>

        <!-- Preference -->
        <div class="flex flex-col gap-2">
          <label for="preference" class="font-semibold text-sm text-gray-700 dark:text-gray-300">
            Preference / Notes
          </label>
          <input
            id="customerPreference"
            disabled
            :value="customerPreference"
            placeholder="e.g., Window seat, Birthday celebration, Dietary requirements..."
            class="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-3 justify-end mt-2 sm:flex-col-reverse">
          <button
            type="button"
            class="px-6 py-3 rounded-lg font-semibold text-sm transition-all border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 sm:w-full"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-6 py-3 rounded-lg font-semibold text-sm transition-all bg-green-500 text-white hover:bg-green-600 sm:w-full"
          >
            Confirm Reservation
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
