import { ReservationsService } from "../../../src/modules/reservations/reservations.service";
import { ReservationsRepository } from "../../../src/modules/reservations/reservations.repository";
import { CustomersRepository } from "../../../src/modules/customers/customers.repository";
import { jest } from "@jest/globals";
import {
  mockReservation,
  mockReservationId,
  mockReservations,
  createMockReservation,
} from "../../fixtures/reservations.fixtures";
import { ReservationStatus } from "../../../src/modules/reservations/reservations.interface";
import {
  mockRedisClient,
  resetRedisMocks,
  setCachedValue,
} from "../../mocks/redis.mock";
import { mockEventsClient, resetEventsMocks } from "../../mocks/events.mock";

jest.mock("../../../src/modules/reservations/reservations.repository");
jest.mock("../../../src/modules/customers/customers.repository");

describe("ReservationsService", () => {
  let service: ReservationsService;
  let mockReservationsRepository: jest.Mocked<ReservationsRepository>;
  let mockCustomersRepository: jest.Mocked<CustomersRepository>;

  beforeEach(async () => {
    resetRedisMocks();
    resetEventsMocks();
    jest.clearAllMocks();

    mockReservationsRepository =
      new ReservationsRepository() as jest.Mocked<ReservationsRepository>;
    mockReservationsRepository.createReservation = jest.fn();
    mockReservationsRepository.checkAvailability = jest.fn();
    mockReservationsRepository.getReservationByIds = jest.fn();
    mockReservationsRepository.bulkUpdateReservation = jest.fn();

    mockCustomersRepository =
      new CustomersRepository() as jest.Mocked<CustomersRepository>;
    mockCustomersRepository.getCustomerById = jest.fn();

    service = await ReservationsService.create();
    (service as any).reservationsRepository = mockReservationsRepository;
    (service as any).customersRepository = mockCustomersRepository;
    (service as any).events = mockEventsClient;
  });

  describe("createReservation", () => {
    it("should create reservation and publish confirmed event", async () => {
      mockCustomersRepository.getCustomerById.mockResolvedValue({
        id: mockReservation.customerId,
      } as any);
      mockReservationsRepository.checkAvailability.mockResolvedValue([]);
      mockReservationsRepository.createReservation.mockResolvedValue([
        { id: mockReservationId },
      ] as any);

      const input = createMockReservation({ status: ReservationStatus.CONFIRMED });
      const result = await service.createReservation(input);

      expect(result).toEqual([{ id: mockReservationId }]);
      expect(mockReservationsRepository.checkAvailability).toHaveBeenCalled();
      expect(mockReservationsRepository.createReservation).toHaveBeenCalledWith(
        expect.objectContaining({ status: ReservationStatus.CONFIRMED })
      );
      expect(mockEventsClient.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "reservation.confirmed",
          payload: expect.objectContaining({
            id: mockReservationId,
            tableId: input.tableId,
            customerId: input.customerId,
          }),
        }),
        {
          exchange: "reservation.events",
          routingKey: "reservation.confirmed",
        }
      );
    });

    it("should throw when customer does not exist", async () => {
      mockCustomersRepository.getCustomerById.mockResolvedValue(undefined as any);

      await expect(service.createReservation(mockReservation as any)).rejects.toThrow(
        "Customer does not exist"
      );
      expect(mockReservationsRepository.checkAvailability).not.toHaveBeenCalled();
    });

    it("should throw when table is not available", async () => {
      mockCustomersRepository.getCustomerById.mockResolvedValue({
        id: mockReservation.customerId,
      } as any);
      mockReservationsRepository.checkAvailability.mockResolvedValue([
        createMockReservation({ id: "conflict" }),
      ] as any);

      await expect(service.createReservation(mockReservation as any)).rejects.toThrow(
        "Table is already reserved for the selected time slot"
      );
      expect(mockReservationsRepository.createReservation).not.toHaveBeenCalled();
    });
  });

  describe("getReservationByIds", () => {
    it("should return cached reservation when available", async () => {
      const ids = [mockReservationId];
      setCachedValue(`reservations:${ids.join(",")}`, mockReservations);

      const result = await service.getReservationByIds(ids);

      expect(result).toEqual(mockReservations);
      expect(mockRedisClient.get).toHaveBeenCalledWith(
        `reservations:${ids.join(",")}`
      );
      expect(mockReservationsRepository.getReservationByIds).not.toHaveBeenCalled();
    });

    it("should fetch from repository and cache when not in cache", async () => {
      const ids = [mockReservationId];
      mockRedisClient.get.mockResolvedValue(null);
      mockReservationsRepository.getReservationByIds.mockResolvedValue(
        mockReservations as any
      );

      const result = await service.getReservationByIds(ids);

      expect(result).toEqual(mockReservations);
      expect(mockReservationsRepository.getReservationByIds).toHaveBeenCalledWith(
        ids
      );
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        `reservations:${ids.join(",")}`,
        JSON.stringify(mockReservations)
      );
    });
  });

  describe("cancelReservation", () => {
    it("should publish cancelled events and bulk update status", async () => {
      const ids = [mockReservationId];
      mockRedisClient.get.mockResolvedValue(null);
      mockReservationsRepository.getReservationByIds.mockResolvedValue(
        [{ ...mockReservation, status: ReservationStatus.CONFIRMED }] as any
      );
      mockReservationsRepository.bulkUpdateReservation.mockResolvedValue([
        { id: mockReservationId },
      ] as any);

      const result = await service.cancelReservation(ids);

      expect(mockEventsClient.publish).toHaveBeenCalledWith(
        expect.objectContaining({ type: "reservation.cancelled" }),
        {
          exchange: "reservation.events",
          routingKey: "reservation.cancelled",
        }
      );
      expect(mockReservationsRepository.bulkUpdateReservation).toHaveBeenCalledWith(
        ids,
        { status: ReservationStatus.CANCELLED }
      );
      expect(result).toEqual([{ id: mockReservationId }]);
    });

    it("should throw when reservation ids do not match fetched reservations", async () => {
      const ids = ["id-1", "id-2"];
      mockRedisClient.get.mockResolvedValue(null);
      mockReservationsRepository.getReservationByIds.mockResolvedValue([
        { ...mockReservation, id: "id-1", status: ReservationStatus.CONFIRMED },
      ] as any);

      await expect(service.cancelReservation(ids)).rejects.toThrow(
        "Reservation does not exist"
      );
    });

    it("should throw when reservation is not confirmed", async () => {
      const ids = [mockReservationId];
      mockRedisClient.get.mockResolvedValue(null);
      mockReservationsRepository.getReservationByIds.mockResolvedValue([
        { ...mockReservation, status: ReservationStatus.CANCELLED },
      ] as any);

      await expect(service.cancelReservation(ids)).rejects.toThrow(
        "Reservation is not confirmed"
      );
    });
  });

  describe("seatReservation", () => {
    it("should publish completed events and bulk update status", async () => {
      const ids = [mockReservationId];
      mockRedisClient.get.mockResolvedValue(null);
      mockReservationsRepository.getReservationByIds.mockResolvedValue(
        [{ ...mockReservation, status: ReservationStatus.CONFIRMED }] as any
      );
      mockReservationsRepository.bulkUpdateReservation.mockResolvedValue([
        { id: mockReservationId },
      ] as any);

      const result = await service.seatReservation(ids);

      expect(mockEventsClient.publish).toHaveBeenCalledWith(
        expect.objectContaining({ type: "reservation.completed" }),
        {
          exchange: "reservation.events",
          routingKey: "reservation.completed",
        }
      );
      expect(mockReservationsRepository.bulkUpdateReservation).toHaveBeenCalledWith(
        ids,
        { status: ReservationStatus.COMPLETED }
      );
      expect(result).toEqual([{ id: mockReservationId }]);
    });

    it("should throw when reservation is not confirmed", async () => {
      const ids = [mockReservationId];
      mockRedisClient.get.mockResolvedValue(null);
      mockReservationsRepository.getReservationByIds.mockResolvedValue([
        { ...mockReservation, status: ReservationStatus.COMPLETED },
      ] as any);

      await expect(service.seatReservation(ids)).rejects.toThrow(
        "Reservation is not confirmed"
      );
    });
  });
});
