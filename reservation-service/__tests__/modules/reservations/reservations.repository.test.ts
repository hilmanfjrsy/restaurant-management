import { ReservationsRepository } from "../../../src/modules/reservations/reservations.repository";
import { mockDb } from "../../mocks/db.mock";
import {
  mockReservation,
  mockReservations,
  mockReservationId,
  mockTableId,
  createMockReservation,
  mockConflictingReservation,
} from "../../fixtures/reservations.fixtures";
import {
  sqlInjectionPayloadsArray,
  maliciousDateInputs,
  maliciousTimeInputs,
  maliciousIdInputs,
} from "../../fixtures/security.fixtures";
import { ReservationStatus } from "../../../src/modules/reservations/reservations.interface";

describe("ReservationsRepository", () => {
  let repository: ReservationsRepository;

  beforeEach(() => {
    repository = new ReservationsRepository();
  });

  describe("createReservation", () => {
    it("should create a reservation and return the id", async () => {
      const newReservation = createMockReservation({
        status: ReservationStatus.CONFIRMED,
      });
      mockDb._setResult([{ id: mockReservationId }]);

      const result = await repository.createReservation(newReservation);

      expect(result).toEqual([{ id: mockReservationId }]);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(newReservation);
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it("should create reservation with all required fields", async () => {
      const reservation = {
        tableId: mockTableId,
        customerId: "cust-123",
        date: "2024-02-20",
        startTime: "19:00:00",
        endTime: "21:00:00",
        partySize: 2,
        status: ReservationStatus.CONFIRMED,
      };
      mockDb._setResult([{ id: "new-id" }]);

      await repository.createReservation(reservation);

      expect(mockDb.values).toHaveBeenCalledWith(reservation);
    });

    it("should handle large party size", async () => {
      const reservation = createMockReservation({ partySize: 20 });
      mockDb._setResult([{ id: mockReservationId }]);

      const result = await repository.createReservation(reservation);

      expect(result).toEqual([{ id: mockReservationId }]);
    });
  });

  describe("checkAvailability", () => {
    it("should return empty array when no conflicts exist", async () => {
      mockDb._setResult([]);

      const result = await repository.checkAvailability(
        mockTableId,
        "2024-01-15",
        "18:00:00",
        "20:00:00"
      );

      expect(result).toEqual([]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it("should return conflicting reservations when they exist", async () => {
      mockDb._setResult([mockConflictingReservation]);

      const result = await repository.checkAvailability(
        mockTableId,
        "2024-01-15",
        "18:00:00",
        "20:00:00"
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockConflictingReservation);
    });

    it("should check for exact same time slot conflict", async () => {
      const exactConflict = createMockReservation({
        startTime: "18:00:00",
        endTime: "20:00:00",
      });
      mockDb._setResult([exactConflict]);

      const result = await repository.checkAvailability(
        mockTableId,
        "2024-01-15",
        "18:00:00",
        "20:00:00"
      );

      expect(result).toHaveLength(1);
    });

    it("should handle adjacent time slots (no conflict)", async () => {
      mockDb._setResult([]);

      const result = await repository.checkAvailability(
        mockTableId,
        "2024-01-15",
        "20:00:00",
        "22:00:00"
      );

      expect(result).toEqual([]);
    });

    it("should detect overlapping start time", async () => {
      const overlap = createMockReservation({
        startTime: "17:00:00",
        endTime: "19:00:00",
      });
      mockDb._setResult([overlap]);

      const result = await repository.checkAvailability(
        mockTableId,
        "2024-01-15",
        "18:00:00",
        "20:00:00"
      );

      expect(result).toHaveLength(1);
    });

    it("should detect overlapping end time", async () => {
      const overlap = createMockReservation({
        startTime: "19:00:00",
        endTime: "21:00:00",
      });
      mockDb._setResult([overlap]);

      const result = await repository.checkAvailability(
        mockTableId,
        "2024-01-15",
        "18:00:00",
        "20:00:00"
      );

      expect(result).toHaveLength(1);
    });

    it("should return multiple conflicts when they exist", async () => {
      mockDb._setResult([mockConflictingReservation, mockReservation]);

      const result = await repository.checkAvailability(
        mockTableId,
        "2024-01-15",
        "17:00:00",
        "21:00:00"
      );

      expect(result).toHaveLength(2);
    });
  });

  describe("getReservationByIds", () => {
    it("should return reservations for given IDs", async () => {
      const ids = mockReservations.map((r) => r.id);
      mockDb._setResult(mockReservations);

      const result = await repository.getReservationByIds(ids);

      expect(result).toEqual(mockReservations);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it("should return empty array when no reservations found", async () => {
      mockDb._setResult([]);

      const result = await repository.getReservationByIds(["non-existent"]);

      expect(result).toEqual([]);
    });

    it("should handle single ID in array", async () => {
      mockDb._setResult([mockReservation]);

      const result = await repository.getReservationByIds([mockReservationId]);

      expect(result).toEqual([mockReservation]);
    });

    it("should handle large array of IDs", async () => {
      const largeIdList = Array.from({ length: 100 }, (_, i) => `id-${i}`);
      const largeResults = largeIdList.map((id) =>
        createMockReservation({ id })
      );
      mockDb._setResult(largeResults);

      const result = await repository.getReservationByIds(largeIdList);

      expect(result).toHaveLength(100);
    });

    it("should handle duplicate IDs in array", async () => {
      const duplicateIds = [mockReservationId, mockReservationId];
      mockDb._setResult([mockReservation]);

      const result = await repository.getReservationByIds(duplicateIds);

      expect(mockDb.where).toHaveBeenCalled();
    });

    it("should handle empty array", async () => {
      mockDb._setResult([]);

      const result = await repository.getReservationByIds([]);

      expect(result).toEqual([]);
    });
  });

  describe("bulkUpdateReservation", () => {
    it("should update multiple reservations", async () => {
      const ids = mockReservations.map((r) => r.id);
      const updateResult = ids.map((id) => ({ id }));
      mockDb._setResult(updateResult);

      const result = await repository.bulkUpdateReservation(ids, {
        status: ReservationStatus.CANCELLED,
      });

      expect(result).toEqual(updateResult);
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({
        status: ReservationStatus.CANCELLED,
      });
    });

    it("should handle empty ID array", async () => {
      mockDb._setResult([]);

      const result = await repository.bulkUpdateReservation([], {
        status: ReservationStatus.CANCELLED,
      });

      expect(result).toEqual([]);
    });

    it("should handle single reservation update", async () => {
      mockDb._setResult([{ id: mockReservationId }]);

      const result = await repository.bulkUpdateReservation(
        [mockReservationId],
        { status: ReservationStatus.COMPLETED }
      );

      expect(result).toEqual([{ id: mockReservationId }]);
    });

    it("should update to CANCELLED status", async () => {
      mockDb._setResult([{ id: mockReservationId }]);

      await repository.bulkUpdateReservation([mockReservationId], {
        status: ReservationStatus.CANCELLED,
      });

      expect(mockDb.set).toHaveBeenCalledWith({
        status: ReservationStatus.CANCELLED,
      });
    });

    it("should update to COMPLETED status", async () => {
      mockDb._setResult([{ id: mockReservationId }]);

      await repository.bulkUpdateReservation([mockReservationId], {
        status: ReservationStatus.COMPLETED,
      });

      expect(mockDb.set).toHaveBeenCalledWith({
        status: ReservationStatus.COMPLETED,
      });
    });

    it("should handle partial update", async () => {
      mockDb._setResult([{ id: mockReservationId }]);

      await repository.bulkUpdateReservation([mockReservationId], {
        partySize: 6,
      });

      expect(mockDb.set).toHaveBeenCalledWith({ partySize: 6 });
    });
  });

  describe("SQL Injection Prevention", () => {
    describe("createReservation", () => {
      it.each(sqlInjectionPayloadsArray)(
        "should safely handle malicious tableId: %s",
        async (maliciousId) => {
          const reservation = createMockReservation({ tableId: maliciousId });
          mockDb._setResult([{ id: "safe-id" }]);

          await repository.createReservation(reservation);

          expect(mockDb.values).toHaveBeenCalledWith(
            expect.objectContaining({ tableId: maliciousId })
          );
        }
      );

      it("should safely handle malicious customerId", async () => {
        const reservation = createMockReservation({
          customerId: "'; DROP TABLE customers; --",
        });
        mockDb._setResult([{ id: "safe-id" }]);

        await repository.createReservation(reservation);

        expect(mockDb.insert).toHaveBeenCalled();
      });
    });

    describe("checkAvailability", () => {
      it.each(maliciousIdInputs)(
        "should safely handle malicious tableId: %s",
        async (maliciousId) => {
          mockDb._setResult([]);

          await repository.checkAvailability(
            maliciousId,
            "2024-01-15",
            "18:00:00",
            "20:00:00"
          );

          expect(mockDb.where).toHaveBeenCalled();
        }
      );

      it.each(maliciousDateInputs)(
        "should safely handle malicious date: %s",
        async (maliciousDate) => {
          mockDb._setResult([]);

          await repository.checkAvailability(
            mockTableId,
            maliciousDate,
            "18:00:00",
            "20:00:00"
          );

          expect(mockDb.where).toHaveBeenCalled();
        }
      );

      it.each(maliciousTimeInputs)(
        "should safely handle malicious time: %s",
        async (maliciousTime) => {
          mockDb._setResult([]);

          await repository.checkAvailability(
            mockTableId,
            "2024-01-15",
            maliciousTime,
            "20:00:00"
          );

          expect(mockDb.where).toHaveBeenCalled();
        }
      );
    });

    describe("getReservationByIds", () => {
      it.each(sqlInjectionPayloadsArray)(
        "should safely handle malicious id: %s",
        async (maliciousId) => {
          mockDb._setResult([]);

          await repository.getReservationByIds([maliciousId]);

          expect(mockDb.where).toHaveBeenCalled();
        }
      );

      it("should safely handle array with mixed malicious ids", async () => {
        const mixedIds = [
          mockReservationId,
          "'; DROP TABLE reservations; --",
          "valid-id",
        ];
        mockDb._setResult([]);

        await repository.getReservationByIds(mixedIds);

        expect(mockDb.where).toHaveBeenCalled();
      });
    });

    describe("bulkUpdateReservation", () => {
      it.each(sqlInjectionPayloadsArray)(
        "should safely handle malicious id in update: %s",
        async (maliciousId) => {
          mockDb._setResult([]);

          await repository.bulkUpdateReservation([maliciousId], {
            status: ReservationStatus.CANCELLED,
          });

          expect(mockDb.where).toHaveBeenCalled();
        }
      );

      it("should handle injection in update payload", async () => {
        mockDb._setResult([]);

        await repository.bulkUpdateReservation([mockReservationId], {
          tableId: "'; DROP TABLE reservations; --",
        } as any);

        expect(mockDb.set).toHaveBeenCalled();
      });
    });
  });
});
