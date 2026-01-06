from fastapi import FastAPI, WebSocket
from backend.websocket import student_socket, teacher_socket

app = FastAPI()


@app.get("/")
def root():
    return {"status": "SmartSession backend running"}


# Student sends frames
@app.websocket("/ws/student")
async def student_ws(websocket: WebSocket):
    await student_socket(websocket)


# Teacher receives live state
@app.websocket("/ws/teacher")
async def teacher_ws(websocket: WebSocket):
    await teacher_socket(websocket)
