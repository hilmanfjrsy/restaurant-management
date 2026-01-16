import {
  IReservation,
  ReservationStatus,
} from "../../src/modules/reservations/reservations.interface";

export const mockReservationId = "res-a1b2c3d4-e5f6-7890-abcd-ef1234567890";
export const mockTableId = "table-a1b2c3d4-e5f6-7890-abcd-ef1234567890";
export const mockCustomerId = "cust-a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export const mockReservation: IReservation & { id: string } = {
  id: mockReservationId,
  tableId: mockTableId,
  customerId: mockCustomerId,
  date: "2024-01-15",
  startTime: "18:00:00",
  endTime: "20:00:00",
  partySize: 4,
  status: ReservationStatus.CONFIRMED,
};

export const mockReservations = [
  { ...mockReservation },
  {
    ...mockReservation,
    id: "res-b2c3d4e5",
    tableId: "table-b2c3d4e5",
    startTime: "20:00:00",
    endTime: "22:00:00",
  },
];

export const createMockReservation = (
  overrides: Partial<IReservation & { id: string }> = {}
): IReservation & { id: string } => ({
  ...mockReservation,
  ...overrides,
});

export const mockConflictingReservation = createMockReservation({
  id: "res-conflict",
  startTime: "17:00:00",
  endTime: "19:00:00",
});

export const mockCancelledReservation = createMockReservation({
  id: "res-cancelled",
  status: ReservationStatus.CANCELLED,
});

export const mockCompletedReservation = createMockReservation({
  id: "res-completed",
  status: ReservationStatus.COMPLETED,
});
