import WebSocket from "ws";

class WSManager {
  private clients: Set<WebSocket>;

  constructor() {
    this.clients = new Set();
  }

  addClient(ws: WebSocket) {
    this.clients.add(ws);
  }

  removeClient(ws: WebSocket) {
    this.clients.delete(ws);
  }

  broadcast(data: string) {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    })
  }
}

export const wsManager = new WSManager()