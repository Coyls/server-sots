import { WebsocketMessage } from "./types";

export const parseMessage = (message: string): WebsocketMessage => JSON.parse(message);


