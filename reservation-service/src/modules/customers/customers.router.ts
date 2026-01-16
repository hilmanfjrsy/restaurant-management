import { Request, Router, Response } from "express";
import { CustomersService } from "./customers.service";
import { errorResponse, successResponse } from "../../shared/utils";


const customersRouter = Router();

const customersService = new CustomersService();

customersRouter.get("/", async (req: Request, res: Response) => {
  try {
    const page = req.query.page as string || "1";
    const limit = req.query.limit as string || "10";

    const customers = await customersService.getCustomers({ page: parseInt(page), limit: parseInt(limit) });
    return successResponse(res, customers);
  } catch (error) {
    return errorResponse(res, null, "Failed to get customers", 500);
  }
});

export default customersRouter;