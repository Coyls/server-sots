export type WebsocketMessage = MovenetMessage | DeviceMessage


// --- Message ---
export interface MovenetMessage {
    type : MessageType.MOVENET
    data : MovenetData
}

export interface DeviceMessage {
    type : MessageType.DEVICE
    data : DeviceData
}

export enum MessageType {
  MOVENET = "MOVENET",
  DEVICE = "DEVICE",
}

// --- Device ---
export interface DeviceData {
    name : string
}

// --- Movenet ---
export interface MovenetData {
    keypoints : Keypoint[]
}

export interface Keypoint {
    y: number
    x: number
    score: number
    name: KeypointType
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
    RIGHT_ANKLE = "right_ankle"
}
