import cv2

available_cameras = []
i = 0

while True:
    cap = cv2.VideoCapture(i)
    if not cap.read()[0]:
        break
    else:
        available_cameras.append(i)
    cap.release()
    i += 1

print("Webcams disponibles : ", available_cameras)
