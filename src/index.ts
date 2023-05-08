import express from "express";
import http from "http";
import WebSocket from "ws";
import { WebSocketManager } from "./websocket/websocket-manager";
import { parseMessage } from "./websocket/utils";

const app = express();
const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });
const websocketManager = new WebSocketManager();

webSocketServer.on("connection", (ws: WebSocket) => {
  ws.on("message", (msg: string, isBinary: boolean) => {
    const msgToString = isBinary ? msg : msg.toString();

    if (msgToString !== "undefined") {
      // console.log("msgToString:", msgToString);
      websocketManager.onMessage(parseMessage(msgToString), ws);
    }
  });
  ws.on("close", () => websocketManager.onClose(ws));
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
