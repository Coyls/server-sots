import { MovenetRawData } from "../websocket/types";
import { MovenetData } from './types';

export const parseMovenetRawData = (data: MovenetRawData): MovenetData => {
  return data.keypoints.reduce((acc, kp) => {
    const { name, ...rest } = kp;
    acc[name] = rest;
    return acc;
  }, {} as MovenetData);
};