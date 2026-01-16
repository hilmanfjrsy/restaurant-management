import { Server } from "http";
import { WebSocketServer } from "ws";
import { wsManager } from "./ws.manager";

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected");
    wsManager.addClient(ws)

    ws.on("close", () => {
      console.log("Client disconnected");
      wsManager.removeClient(ws)
    });

    ws.on("error", (error) => {
      console.error("WebSocket error: ", error);
      wsManager.removeClient(ws)
    });
  });
}