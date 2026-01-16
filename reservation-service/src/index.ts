import express, { Request, Response } from "express";
import { ENV } from "./config/env";
import reservationRouter from "./modules/reservations/reservations.router";
import morgan from "morgan"
import cors from "cors"
import { apiKeyMiddleware } from "./middleware/apiKeyMiddleware";
import customersRouter from "./modules/customers/customers.router";

const app = express();

app.use(cors())
app.use(morgan("dev"))

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Express + Bun + TypeScript + Nodemon + Dotenv 🚀",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "reservation-service",
    timestamp: new Date().toISOString(),
  });
});

app.use(apiKeyMiddleware)
app.use("/reservations", reservationRouter);
app.use("/customers", customersRouter)
app.listen(ENV.PORT, () => {
  console.log(`Server running on http://localhost:${ENV.PORT}`);
});
