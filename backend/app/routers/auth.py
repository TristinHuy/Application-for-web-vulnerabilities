from fastapi import APIRouter, Form, Request
from fastapi.responses import JSONResponse, RedirectResponse
from app.db import get_raw_connection

router = APIRouter()


# SQL Injection
@router.post("/login")
async def login(
    username: str = Form(...),
    password: str = Form(...),
):
    conn = get_raw_connection()
    cursor = conn.cursor()

    # SQL Injection
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"

    try:
        cursor.execute(query)
        user = cursor.fetchone()
    except Exception as e:
        cursor.close()
        conn.close()
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

    cursor.close()
    conn.close()

    if user:
        return JSONResponse(content={
            "success": True,
            "user": {
                "id":       user[0],
                "username": user[1],
                "role":     user[3],
            },
            "message": "Đăng nhập thành công"
        })
    else:
        return JSONResponse(
            status_code=401,
            content={"success": False, "message": "Sai tên đăng nhập hoặc mật khẩu"}
        )


#CSRF
@router.post("/transfer")
async def transfer(
    from_account: str = Form(...),
    to_account:   str = Form(...),
    amount:       int = Form(...),
):
   
    conn = get_raw_connection()
    cursor = conn.cursor()

    try:
       
        cursor.execute(
            "SELECT id, balance, owner_name FROM accounts WHERE account_number = %s",
            (from_account,)
        )
        source = cursor.fetchone()

        if not source:
            return JSONResponse(status_code=404, content={"error": "Tài khoản nguồn không tồn tại"})

        if source[1] < amount:
            return JSONResponse(status_code=400, content={"error": "Số dư không đủ"})

        
        cursor.execute(
            "SELECT id, owner_name FROM accounts WHERE account_number = %s",
            (to_account,)
        )
        dest = cursor.fetchone()

        if not dest:
            return JSONResponse(status_code=404, content={"error": "Tài khoản đích không tồn tại"})

      
        cursor.execute(
            "UPDATE accounts SET balance = balance - %s WHERE account_number = %s",
            (amount, from_account)
        )
        cursor.execute(
            "UPDATE accounts SET balance = balance + %s WHERE account_number = %s",
            (amount, to_account)
        )
        conn.commit()

        return JSONResponse(content={
            "success": True,
            "message": f"Chuyển {amount:,} VNĐ từ {source[2]} sang {dest[1]} thành công",
            "from":    from_account,
            "to":      to_account,
            "amount":  amount,
        })

    except Exception as e:
        conn.rollback()
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        cursor.close()
        conn.close()


# OPen Redirect
@router.get("/redirect")
async def open_redirect(next: str = "/dashboard"):
    return RedirectResponse(url=next, status_code=302)