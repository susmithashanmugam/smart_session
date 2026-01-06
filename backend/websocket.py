import base64
import cv2
import numpy as np
import asyncio
from fastapi import WebSocket

from backend.vision.face_mesh import process_frame
from backend.vision.gaze import estimate_gaze
from backend.vision.confusion import calculate_confusion
from backend.vision.gaze import estimate_gaze

# -------------------------------
# Shared state for teacher view
# -------------------------------
latest_state = {
    "status": "WAITING",
    "face_count": 0,
    "gaze": "UNKNOWN",
    "confusion_score": 0,
}


# -------------------------------
# Helper: Decode base64 frame
# -------------------------------
def decode_frame(frame_data):
    img_bytes = base64.b64decode(frame_data)
    img_array = np.frombuffer(img_bytes, dtype=np.uint8)
    frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    return frame


# -------------------------------
# STUDENT WebSocket
# Receives frames + updates state
# -------------------------------
async def student_socket(websocket: WebSocket):
    await websocket.accept()

    while True:
        data = await websocket.receive_text()
        frame = decode_frame(data)

        result = process_frame(frame)

        gaze = "UNKNOWN"
        confusion_score = 0
        is_confused = False

        if result["landmarks"]:
            face_landmarks = result["landmarks"][0]

            gaze = estimate_gaze(face_landmarks.landmark)
            confusion_score = calculate_confusion(face_landmarks.landmark)

            if confusion_score >= 0.6:
                is_confused = True

        # Final status decision
        if result["face_count"] != 1:
            status = "PROCTOR_ALERT"
        elif gaze != "CENTER":
            status = "PROCTOR_ALERT"
        elif is_confused:
            status = "CONFUSED"
        else:
            status = "FOCUSED"

        # 🔥 Update shared state (IMPORTANT)
        latest_state.update({
            "status": status,
            "face_count": result["face_count"],
            "gaze": gaze,
            "confusion_score": confusion_score,
        })

        # Send response back to student
        await websocket.send_json(latest_state)


# -------------------------------
# TEACHER WebSocket
# Only sends latest state
# -------------------------------
async def teacher_socket(websocket: WebSocket):
    await websocket.accept()

    while True:
        await websocket.send_json(latest_state)
        await asyncio.sleep(0.5)
