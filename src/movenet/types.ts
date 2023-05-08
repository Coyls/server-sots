import { KeypointType } from "../websocket/types";

export interface Keypoint {
  y: number;
  x: number;
  score: number;
}

export type MovenetData = Record<KeypointType, Keypoint>;

export enum CrossPosition {
  TL = "TL",
  TM = "TM",
  TR = "TR",
  ML = "ML",
  MM = "MM",
  MR = "MR",
  BL = "BL",
  BM = "BM",
  BR = "BR",
}
