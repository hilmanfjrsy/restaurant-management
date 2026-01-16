import type { ReservationPayload } from "@/types/table"
import { useMutation, useQueryClient } from "@tanstack/vue-query"
import { reservationApi } from "../http/reservationApi"

export const useReserveTable = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ReservationPayload) => {
      const { data } = await reservationApi.post(`/reservations`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

export const useCancelReservation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (reservationIds: string[]) => {
      const { data } = await reservationApi.post(`/reservations/cancel`, { reservationIds })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

export const useSeatReservation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (reservationIds: string[]) => {
      const { data } = await reservationApi.post(`/reservations/seat`, { reservationIds })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}