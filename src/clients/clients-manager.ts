import WebSocket from "ws";
import { Client } from "./types";

export class ClientManager {
  clients: Client[] = [];

  addClient(client: Client): Boolean {
    this.clients.push(client);
    return true;
  }

  removeClient(ws: WebSocket): Boolean {
    this.clients = this.clients.filter((cli) => cli.ws !== ws);
    return true;
  }
}
