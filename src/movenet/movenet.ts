import { CrossPosition, Keypoint } from "./types";

export class Movenet {
  static convertPositionToPercent(keypoint: Keypoint): {
    x: number;
    y: number;
  } {
    const { x, y } = keypoint;

    const maxX = 600
    const maxY = 475
    const cent = 100

    return {
      x: x * cent / maxX,
      y: y * cent / maxY,
    };
  }

  static convertPositionToCross(keypoint: Keypoint): CrossPosition {
    const { x, y } = keypoint;

    let posX = "M";
    let posY = "M";

    // --- Y ---
    if (y < 150) {
      posY = "T";
    }

    if (y >= 150 && y <= 300) {
      posY = "M";
    }

    if (y > 450) {
      posY = "B";
    }

    // --- X ---
    if (x < 200) {
      posX = "R";
    }

    if (x >= 200 && x <= 400) {
      posX = "M";
    }

    if (x > 400) {
      posX = "L";
    }

    const pos = posY + posX;

    return pos as CrossPosition;
  }
}
