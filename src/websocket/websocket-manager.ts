import WebSocket from "ws";
import { InitMessage, MessageType, WebsocketMessage } from "./types";
import { ClientManager } from "../clients/clients-manager";
import { Client } from "../clients/types";

export class WebSocketManager {
  clientManager = new ClientManager();

  onMessage(msg: WebsocketMessage, sender: WebSocket): void {
    switch (msg.type) {
      case MessageType.INIT:
        this.onInitMessage(msg, sender)
        break;
      case MessageType.MOVENET:
        break;

      default:
        console.log("msg", msg);
        break;
    }
  }

  onClose(ws: WebSocket): void {
    const clientName = this.clientManager.clients.find((cli) => cli.ws)?.name;
    console.log(`Connection close with ${clientName}`);
    this.clientManager.removeClient(ws);
  }

  onInitMessage(msg: InitMessage, sender: WebSocket) {
    this.clientManager.addClient({
      name: msg.data.name,
      ws: sender,
    });
  }
}
