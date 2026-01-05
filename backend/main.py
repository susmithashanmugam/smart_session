from fastapi import FastAPI, WebSocket
from backend.websocket import student_socket

app = FastAPI()


@app.get("/")
def root():
    return {"status": "SmartSession backend running"}


@app.websocket("/ws/student")
async def student_ws(websocket: WebSocket):
    await student_socket(websocket)
