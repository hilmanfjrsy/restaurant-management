<script setup lang="ts">
import type { ITable } from '@/types/table'
import TableCell from './TableCell.vue'

const props = defineProps<{
  title: string
  tables: ITable[]
  selectedTableIds: string[]
  selectionMode: 'reserve' | 'status'
  currentCustomerId: string | null
}>()

const emit = defineEmits<{
  'select-table': [table: ITable]
}>()

function handleTableClick(table: ITable) {
  emit('select-table', table)
}

function isSelected(tableId: string): boolean {
  return props.selectedTableIds.includes(tableId)
}
</script>

<template>
  <div class="bg-slate-900/50 rounded-xl p-6">
    <h3 class="text-slate-500 text-xs font-medium mb-5 uppercase tracking-wider">
      {{ title }}
    </h3>
    <div class="flex flex-wrap" style="gap: 16px;">
      <TableCell
        v-for="table in tables"
        :key="table.id"
        :table="table"
        :is-selected="isSelected(table.id)"
        :selection-mode="selectionMode"
        :current-customer-id="currentCustomerId"
        @click="handleTableClick"
      />
    </div>
  </div>
</template>
