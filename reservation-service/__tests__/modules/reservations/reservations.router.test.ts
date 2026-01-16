import { Request } from "express";
import {
  createMockRequest,
  createMockResponse,
} from "../../mocks/express.mock";
import { mockReservationId } from "../../fixtures/reservations.fixtures";
import { jest } from "@jest/globals";

const mockCreateReservation: any = jest.fn();
const mockCancelReservation: any = jest.fn();
const mockSeatReservation: any = jest.fn();

jest.mock("../../../src/modules/reservations/reservations.service", () => ({
  ReservationsService: {
    create: (jest.fn() as any).mockResolvedValue({
      createReservation: mockCreateReservation,
      cancelReservation: mockCancelReservation,
      seatReservation: mockSeatReservation,
    }),
  },
}));

import reservationsRouter from "../../../src/modules/reservations/reservations.router";

describe("ReservationsRouter", () => {
  let createHandler: any;
  let cancelHandler: any;
  let seatHandler: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    await Promise.resolve();

    const createRoute = reservationsRouter.stack.find(
      (layer: any) => layer.route?.path === "/" && layer.route?.methods?.post
    );
    createHandler = createRoute?.route?.stack[0]?.handle;

    const cancelRoute = reservationsRouter.stack.find(
      (layer: any) =>
        layer.route?.path === "/cancel" && layer.route?.methods?.post
    );
    cancelHandler = cancelRoute?.route?.stack[0]?.handle;

    const seatRoute = reservationsRouter.stack.find(
      (layer: any) => layer.route?.path === "/seat" && layer.route?.methods?.post
    );
    seatHandler = seatRoute?.route?.stack[0]?.handle;

    if (!createHandler || !cancelHandler || !seatHandler) {
      throw new Error("Reservations router handlers not found");
    }
  });

  describe("POST /reservations", () => {
    it("should create reservation", async () => {
      mockCreateReservation.mockResolvedValue([{ id: mockReservationId }] as any);
      const req = createMockRequest({
        body: { tableId: "t1", customerId: "c1" },
      }) as Request;
      const res = createMockResponse();

      await createHandler(req, res);

      expect(mockCreateReservation).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Success",
        data: [{ id: mockReservationId }],
      });
    });

    it("should return 500 on service error", async () => {
      mockCreateReservation.mockRejectedValue(new Error("Failed") as any);
      const req = createMockRequest({ body: {} }) as Request;
      const res = createMockResponse();

      await createHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Failed",
        data: null,
      });
    });
  });

  describe("POST /reservations/cancel", () => {
    it("should cancel reservation", async () => {
      mockCancelReservation.mockResolvedValue([{ id: mockReservationId }] as any);
      const req = createMockRequest({
        body: { reservationIds: [mockReservationId] },
      }) as Request;
      const res = createMockResponse();

      await cancelHandler(req, res);

      expect(mockCancelReservation).toHaveBeenCalledWith([mockReservationId]);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Success",
        data: [{ id: mockReservationId }],
      });
    });

    it("should return 500 on service error", async () => {
      mockCancelReservation.mockRejectedValue(new Error("Cancel failed") as any);
      const req = createMockRequest({ body: { reservationIds: [] } }) as Request;
      const res = createMockResponse();

      await cancelHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Cancel failed",
        data: null,
      });
    });
  });

  describe("POST /reservations/seat", () => {
    it("should seat reservation", async () => {
      mockSeatReservation.mockResolvedValue([{ id: mockReservationId }] as any);
      const req = createMockRequest({
        body: { reservationIds: [mockReservationId] },
      }) as Request;
      const res = createMockResponse();

      await seatHandler(req, res);

      expect(mockSeatReservation).toHaveBeenCalledWith([mockReservationId]);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Success",
        data: [{ id: mockReservationId }],
      });
    });

    it("should return 500 on service error", async () => {
      mockSeatReservation.mockRejectedValue(new Error("Seat failed") as any);
      const req = createMockRequest({ body: { reservationIds: [] } }) as Request;
      const res = createMockResponse();

      await seatHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Seat failed",
        data: null,
      });
    });
  });
});
