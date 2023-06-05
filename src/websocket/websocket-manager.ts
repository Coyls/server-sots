import WebSocket from "ws";
import {
  ArucoMessage,
  BlueMessage,
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
      case MessageType.ARUCO:
        this.onArucoMessage(msg, sender);
        break;
      case MessageType.BLUE:
        this.onBlueMessage(msg, sender);
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
    console.log("INIT:", msg);
    // console.log(msg.data.name + " connect !");
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

  onArucoMessage(msg: ArucoMessage, sender: WebSocket) {
    this.clientManager.sendToId("unity", msg);
  }

  onBlueMessage(msg: BlueMessage, sender: WebSocket) {
    console.log("msg", msg);
    this.clientManager.sendToId("unity", msg);
  }
}
