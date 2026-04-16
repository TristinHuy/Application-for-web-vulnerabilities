from fastapi import APIRouter, Depends
from sqlalchemy import text
from app.db import get_db

router = APIRouter()

@router.get("")
def get_categories(db=Depends(get_db)):
    result = db.execute(text("SELECT id, name, description, icon FROM categories ORDER BY name"))
    return result.mappings().all()
