import WebSocket from "ws";
import {
  InitMessage,
  MessageType,
  MovenetMessage,
  WebsocketMessage,
} from "./types";
import { ClientManager } from "../clients/clients-manager";
import { Movenet } from "../movenet/movenet";
import { parseMovenetRawData } from "../movenet/utils";

export class WebSocketManager {
  clientManager = new ClientManager();

  onMessage(msg: WebsocketMessage, sender: WebSocket): void {
    switch (msg.type) {
      case MessageType.INIT:
        this.onInitMessage(msg, sender);
        break;
      case MessageType.MOVENET:
        this.onMovenetMessage(msg, sender);
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

  onMovenetMessage(msg: MovenetMessage, sender: WebSocket) {
    const { right_wrist } = parseMovenetRawData(msg.data);

    // Voir avec lucas pour envoyer les donnée et les transformer en déplacement
    console.log(Movenet.convertPositionToCross(right_wrist));
    console.log(Movenet.convertPositionToPercent(right_wrist));
  }
}
