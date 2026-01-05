import base64
import cv2
import numpy as np
from fastapi import WebSocket
from backend.vision.face_mesh import process_frame

from backend.vision.gaze import estimate_gaze


def decode_frame(frame_data):
    img_bytes = base64.b64decode(frame_data)
    img_array = np.frombuffer(img_bytes, dtype=np.uint8)
    frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    return frame


async def student_socket(websocket: WebSocket):
    await websocket.accept()

    while True:
        data = await websocket.receive_text()
        frame = decode_frame(data)

        result = process_frame(frame)

        if result["face_count"] == 1:
            status = "OK"
        else:
            status = "ALERT"

        await websocket.send_json({
            "face_count": result["face_count"],
            "status": status
        })
