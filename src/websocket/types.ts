export type WebsocketMessage =
  | MovenetMessage
  | InitMessage
  | ArucoMessage
  | BlueMessage;

// --- Message ---
export interface MovenetMessage {
  type: MessageType.MOVENET;
  data: MovenetRawData;
}

export interface InitMessage {
  type: MessageType.INIT;
  data: DeviceData;
}

export interface ArucoMessage {
  type: MessageType.ARUCO;
  data: ArucoData;
}

export interface BlueMessage {
  type: MessageType.BLUE;
  data: BlueData;
}

export enum MessageType {
  ARUCO = "ARUCO",
  MOVENET = "MOVENET",
  INIT = "INIT",
  BLUE = "BLUE",
}

// -- Blue --
export interface BlueData {
  player: Player;
}

enum Player {
  p1 = "p1",
  p2 = "p2",
}

// -- Aruco --
export interface ArucoData {
  p1: Coords;
  p2: Coords;
}

export interface Coords {
  x: number;
  y: number;
}

// --- Device ---
export interface DeviceData {
  name: string;
}

// --- Movenet ---
export interface MovenetRawData {
  keypoints: KeypointRaw[];
  score: number;
}

export interface KeypointRaw {
  y: number;
  x: number;
  score: number;
  name: KeypointType;
}

export enum KeypointType {
  NOSE = "nose",
  LEFT_EYE = "left_eye",
  RIGHT_EYE = "right_eye",
  LEFT_EAR = "left_ear",
  RIGHT_EAR = "right_ear",
  LEFT_SHOULDER = "left_shoulder",
  RIGHT_SHOULDER = "right_shoulder",
  LEFT_ELBOW = "left_elbow",
  RIGHT_ELBOW = "right_elbow",
  LEFT_WRIST = "left_wrist",
  RIGHT_WRIST = "right_wrist",
  LEFT_HIP = "left_hip",
  RIGHT_HIP = "right_hip",
  LEFT_KNEE = "left_knee",
  RIGHT_KNEE = "right_knee",
  LEFT_ANKLE = "left_ankle",
  RIGHT_ANKLE = "right_ankle",
}
