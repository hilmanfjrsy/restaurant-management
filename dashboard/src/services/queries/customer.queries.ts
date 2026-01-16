import type { ICustomer } from "@/types/table"
import { useQuery } from "@tanstack/vue-query"
import { reservationApi } from "../http/reservationApi"

export const useGetCustomer = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async (): Promise<ICustomer[]> => {
      const { data } = await reservationApi.get("/customers")
      return data.data
    },
  })
}