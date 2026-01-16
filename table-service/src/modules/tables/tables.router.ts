import { Request, Response, Router } from "express";
import { TablesService } from "./tables.service";
import { errorResponse, successResponse } from "../../shared/utils";

const tablesRouter = Router();

const tablesService = new TablesService();

tablesRouter.get("/", async (req: Request, res: Response) => {
  try {
    const page = req.query.page as string || "1";
    const limit = req.query.limit as string || "10";
    const date = req.query.date as string || new Date().toISOString().split('T')[0];
    const time = req.query.time as string || new Date().toTimeString().substring(0, 8);

    const tables = await tablesService.getTables({ page: parseInt(page), limit: parseInt(limit), date, time });
    return successResponse(res, tables);
  } catch (error) {
    return errorResponse(res, null, "Failed to get tables", 500);
  }
});

tablesRouter.patch("/bulk-status", async (req: Request, res: Response) => {
  try {
    const { tableIds, status } = req.body;
    if (!tableIds || !Array.isArray(tableIds)) {
      return errorResponse(res, null, "Table IDs are required and must be an array", 400);
    }
    if (!status) {
      return errorResponse(res, null, "Status is required", 400);
    }
    const updatedTables = await tablesService.bulkUpdateStatus(tableIds, status);
    return successResponse(res, updatedTables);
  } catch (error) {
    return errorResponse(res, null, "Failed to update table statuses", 500);
  }
});

export default tablesRouter;