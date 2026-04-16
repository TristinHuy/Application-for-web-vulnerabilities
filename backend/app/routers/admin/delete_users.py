
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db import get_raw_connection

router = APIRouter()

class DeleteUserRequest(BaseModel):
    user_id: int
    confirm: bool = False

@router.post("/admin/delete-user")
def delete_user(payload: DeleteUserRequest):
    if not payload.confirm:
        raise HTTPException(status_code=400, detail="Bạn phải confirm để xoá user")

    conn = get_raw_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT id, username FROM users WHERE id = %s", (payload.user_id,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User không tồn tại")

        cursor.execute("DELETE FROM users WHERE id = %s", (payload.user_id,))
        conn.commit()

        return {
            "success": True,
            "message": f"Đã xoá user {user[1]} (ID: {user[0]})"
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()