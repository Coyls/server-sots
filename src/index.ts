import express from "express";
import http from "http";
import WebSocket from "ws";
import { onMessage } from "./websocket/on-message";
import { parseMessage } from "./websocket/utils";

const app = express();
const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });

webSocketServer.on("connection", (ws: WebSocket) => {
  ws.on("message", (msg: string) => onMessage(parseMessage(msg), ws));
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
