from fastapi import APIRouter , HTTPException , status , Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth_schemas import RegisterRequest , RegisterResponse
from app.cruds.auth_cruds import register as register_crud


router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)



@router.post(
    "/register",
    response_model=RegisterResponse
)
def register(
    data : RegisterRequest,
    db : Session = Depends(get_db)
) : 
    return register_crud(data , db)