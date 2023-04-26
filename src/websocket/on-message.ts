import WebSocket from "ws";
import { MessageType, WebsocketMessage } from "./types";

export const onMessage = (msg: WebsocketMessage, sender: WebSocket): void => {
    switch (msg.type) {
      case MessageType.DEVICE:
        break;
      case MessageType.MOVENET:
        break;

      default:
        console.log('msg', msg)
        break;
    }
};
