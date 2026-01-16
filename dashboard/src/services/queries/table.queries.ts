import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { tableApi } from '../http/tableApi'
import type { ITable, TableStatus } from '@/types/table'

export interface TableQueryParams {
  date: string
  time: string
}

export const useGetTables = (params: Ref<TableQueryParams>) => {
  const query = useQuery({
    queryKey: computed(() => ['tables', params.value.date, params.value.time]),
    queryFn: async (): Promise<ITable[]> => {
      const { data } = await tableApi.get('/tables', {
        params: {
          limit: 20,
          page: 1,
          date: params.value.date,
          time: params.value.time,
        },
      })
      return data.data
    },
  })

  const indoorTables = computed(() =>
    query.data.value?.filter((t) => t.location === 'indoor') ?? []
  )

  const outdoorTables = computed(() =>
    query.data.value?.filter((t) => t.location === 'outdoor') ?? []
  )

  const getTableById = (tableId: string) =>
    query.data.value?.find((t) => t.id === tableId)

  return {
    ...query,
    indoorTables,
    outdoorTables,
    getTableById,
  }
}

export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ tableIds, status }: { tableIds: string[]; status: TableStatus }) => {
      const { data } = await tableApi.patch('/tables/bulk-status', { tableIds, status })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}
