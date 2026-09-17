from fastapi import APIRouter , Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.addInfo_schemas import FieldResponse , post_addInfo_answer_Request
from app.schemas.shared_schemas import MessageResponse
from app.cruds.addInfo_cruds import (
    get_addInfo_config as get_addInfo_config_crud,
    post_addInfo_answer as post_addInfo_answer_crud
)
from app.dependencies.auth_dependencies import get_current_user
from app.models.bussiness_models import User



router = APIRouter(
    prefix="/api/addInfo",
    tags=["addInfo"]
)



@router.get(
    "/config",
    response_model=list[FieldResponse]
)
def get_addInfo_config(
    db : Session = Depends(get_db)
) :
    return get_addInfo_config_crud(db)



@router.post(
    "/answer",
    response_model=MessageResponse
)
def post_addInfo_answer(
    data : post_addInfo_answer_Request,
    current_user : User = Depends(get_current_user),
    db : Session = Depends(get_db)
) : 

    return post_addInfo_answer_crud(data , current_user , db)