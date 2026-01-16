import { Request, Response, NextFunction } from "express";
import { ENV } from "../config/env";
import { errorResponse } from "../shared/utils";

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== ENV.API_KEY) {
    return errorResponse(res, null, "Unauthorized", 401);
  }
  next();
}