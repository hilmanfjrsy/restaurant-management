import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useTableUIStore = defineStore('tableUI', () => {
  const selectedTableIds = ref<string[]>([])
  const selectionMode = ref<'reserve' | 'status'>('status')

  function toggleSelection(tableId: string) {
    const index = selectedTableIds.value.indexOf(tableId)
    if (index === -1) {
      selectedTableIds.value.push(tableId)
    } else {
      selectedTableIds.value.splice(index, 1)
    }
  }

  function clearSelection() {
    selectedTableIds.value = []
  }

  function selectAll(tableIds: string[]) {
    selectedTableIds.value = [...tableIds]
  }

  function setSelectionMode(mode: 'reserve' | 'status') {
    selectionMode.value = mode
    clearSelection()
  }

  function isSelected(tableId: string) {
    return selectedTableIds.value.includes(tableId)
  }

  return {
    selectedTableIds,
    selectionMode,
    toggleSelection,
    clearSelection,
    selectAll,
    setSelectionMode,
    isSelected,
  }
})
