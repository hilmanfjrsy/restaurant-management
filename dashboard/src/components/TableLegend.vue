<script setup lang="ts">
const legendItems = [
  { label: 'Available', colorClass: 'bg-slate-700' },
  { label: 'Selected', colorClass: 'bg-sky-400/40' },
  { label: 'Reserved', colorClass: 'bg-slate-700/50' },
  { label: 'Your Reservation', colorClass: 'bg-violet-400/40' },
  { label: 'Seated', colorClass: 'bg-emerald-400/40' },
  { label: 'Cleaning', colorClass: 'bg-amber-400/40' },
]
</script>

<template>
  <div class="flex flex-col gap-2 text-xs text-slate-400">
    <div
      v-for="item in legendItems"
      :key="item.label"
      class="flex items-center gap-2"
    >
      <span :class="['w-3 h-3 rounded', item.colorClass]"></span>
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>
