export type TableStatus = 'available' | 'seated' | 'reserved' | 'cleaning'

export type TableLocation = 'indoor' | 'outdoor'

export interface Reservation {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  preference: string
  totalPersons: number
  reservedAt: string
}

export interface ITable {
  id: string
  number: string
  capacity: number
  location: TableLocation
  status: TableStatus
  reservation: Reservation | null
}

export interface ICustomer {
  id: string
  name: string
  email: string
  preference?: string
}

export interface ReservationPayload {
  tableId: string
  customerId: string
  partySize: number
  date: string // YYYY-MM-DD format
  startTime: string // HH:mm format
  endTime: string // HH:mm format
}
