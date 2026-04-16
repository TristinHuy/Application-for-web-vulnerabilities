from fastapi import APIRouter
from pydantic import BaseModel
import time

router = APIRouter()

class SleepRequest(BaseModel):
    seconds: int = 1

@router.post("/admin/sleep")
def sleep_api(payload: SleepRequest):
    sec = max(0, min(payload.seconds, 10))  

    time.sleep(sec)

    return {
        "message": f"Server sleep {sec} giây",
        "status": "done"
    }