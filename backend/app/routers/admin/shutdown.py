# shutdown.py

from fastapi import APIRouter
from fastapi.responses import JSONResponse
import sys

router = APIRouter()

@router.post("/admin/shutdown")
def shutdown():
    return JSONResponse(
        content={"message": "Server đang tắt..."},
        status_code=200
    )
