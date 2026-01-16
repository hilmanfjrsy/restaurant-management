import express, { Request, Response } from "express";
import { ENV } from "./config/env";
import tablesRouter from "./modules/tables/tables.router";
import morgan from "morgan"
import cors from "cors"
import { apiKeyMiddleware } from "./middleware/apiKeyMiddleware";
import { startEventSubscriber } from "./subscribers";
import { setupWebSocketServer } from "./websocket/ws.server"
import http from "http";

const app = express();
const server = http.createServer(app);

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
    service: "table-service",
    timestamp: new Date().toISOString(),
  });
});

app.use(apiKeyMiddleware)
app.use("/tables", tablesRouter);
setupWebSocketServer(server)
await startEventSubscriber()
server.listen(ENV.PORT, async () => {
  console.log(`Server running on http://localhost:${ENV.PORT}`);
});
