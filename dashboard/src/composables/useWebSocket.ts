import { ref, onMounted, onUnmounted } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'

export function useTableWebSocket() {
  const queryClient = useQueryClient()
  const isConnected = ref(false)
  let ws: WebSocket | null = null
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

  function connect() {
    const wsUrl = import.meta.env.VITE_TABLE_SERVICE_WS_URL || 'ws://localhost:4000'
    ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      isConnected.value = true
      console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        // Invalidate tables query on any table event
        if (data.type?.startsWith('table.')) {
          queryClient.invalidateQueries({ queryKey: ['tables'] })
        }
      } catch (e) {
        console.error('WebSocket message parse error:', e)
      }
    }

    ws.onclose = () => {
      isConnected.value = false
      console.log('WebSocket disconnected, reconnecting in 3s...')
      // Reconnect after 3 seconds
      reconnectTimeout = setTimeout(connect, 3000)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  function disconnect() {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
    ws?.close()
    ws = null
  }

  onMounted(connect)
  onUnmounted(disconnect)

  return { isConnected }
}
