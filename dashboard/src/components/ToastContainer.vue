<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

function getToastClasses(type: 'success' | 'error' | 'info') {
  switch (type) {
    case 'success':
      return 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
    case 'error':
      return 'bg-rose-400/20 text-rose-300 border-rose-400/30'
    case 'info':
      return 'bg-sky-400/20 text-sky-300 border-sky-400/30'
  }
}
</script>

<template>
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'px-4 py-3 rounded-lg border backdrop-blur-sm text-sm min-w-[250px] flex items-center justify-between gap-3',
          getToastClasses(toast.type),
        ]"
      >
        <span>{{ toast.message }}</span>
        <button
          class="cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
          @click="removeToast(toast.id)"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
