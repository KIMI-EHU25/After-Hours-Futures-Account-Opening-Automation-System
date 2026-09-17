from fastapi import APIRouter , HTTPException , status , Depends
from sqlalchemy.orm import Session

from app.cruds.auth_cruds import (
    register as register_crud,
    login as login_crud,
    refresh as refresh_crud
)
from app.database import get_db
from app.schemas.auth_schemas import (
    RegisterRequest ,
    RegisterResponse ,
    LoginRequest ,
    LoginResponse ,
    RefreshRequest ,
    RefreshResponse
)


router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)



@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    data : RegisterRequest,
    db : Session = Depends(get_db)
) : 
    return register_crud(data , db)



@router.post(
    "/login",
    response_model=LoginResponse
)
def login(
    data : LoginRequest,
    db : Session = Depends(get_db)
) : 
    return login_crud(data , db)



@router.post(
    "/refresh",
    response_model=RefreshResponse
)
def refresh(
    data : RefreshRequest , 
    db : Session = Depends(get_db)
) : 
    return refresh_crud(data , db)
