from fastapi import APIRouter , HTTPException , status , Depends
from sqlalchemy.orm import Session

from app.models.bussiness_models import User
from app.dependencies.auth_dependencies import get_current_user
from app.cruds.auth_cruds import (
    register as register_crud,
    login as login_crud,
    refresh as refresh_crud,
    logout as logout_crud
)
from app.database import get_db
from app.schemas.auth_schemas import (
    RegisterRequest ,
    RegisterResponse ,
    LoginRequest ,
    LoginResponse ,
    RefreshRequest ,
    RefreshResponse ,
    LogoutRequest
)
from app.schemas.shared_schemas import MessageResponse


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



@router.post(
    "/logout",
    response_model=MessageResponse
)
def logout(
    data : LogoutRequest ,
    current_user : User = Depends(get_current_user),
    db : Session = Depends(get_db)
) : 
    return logout_crud(data , current_user , db)