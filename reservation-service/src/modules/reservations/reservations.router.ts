import { Request, Response, Router } from "express";
import { errorResponse, successResponse } from "../../shared/utils";
import { ReservationsService } from "./reservations.service";

const reservationRouter = Router();

let reservationService: ReservationsService;

const initializeService = async () => {
  reservationService = await ReservationsService.create();
};

initializeService();

reservationRouter.post("/", async (req: Request, res: Response) => {
  try {
    const createReservation = await reservationService.createReservation(req.body);
    return successResponse(res, createReservation);
  } catch (error: any) {
    return errorResponse(res, null, error.message || "Failed to create reservation", 500);
  }
})

reservationRouter.post("/cancel", async (req: Request, res: Response) => {
  try {
    const { reservationIds } = req.body;
    const cancelReservation = await reservationService.cancelReservation(reservationIds);
    return successResponse(res, cancelReservation);
  } catch (error: any) {
    return errorResponse(res, null, error.message || "Failed to cancel reservation", 500);
  }
})

reservationRouter.post("/seat", async (req: Request, res: Response) => {
  try {
    const { reservationIds } = req.body;
    const seatReservation = await reservationService.seatReservation(reservationIds);
    return successResponse(res, seatReservation);
  } catch (error: any) {
    return errorResponse(res, null, error.message || "Failed to seat reservation", 500);
  }
})
export default reservationRouter;