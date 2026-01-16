export interface IReservation {
  tableId: string
  customerId: string
  date: string
  startTime: string
  endTime: string
  partySize: number
  status: ReservationStatus
}

export interface IReservationPagination {
  page: number;
  limit: number;
}

export enum ReservationStatus {
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}