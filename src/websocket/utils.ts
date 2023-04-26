import { WebsocketMessage } from "./types";

export const parseMessage = (message: string): WebsocketMessage => {
    return JSON.parse(message) 
};