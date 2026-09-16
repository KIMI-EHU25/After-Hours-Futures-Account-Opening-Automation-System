from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.addInfo_schemas import FieldResponse , post_addInfo_answer_Request
from app.cruds.addInfo_cruds import (
    get_addInfo_config as get_addInfo_config_crud,
    post_addInfo_answer as post_addInfo_answer_crud
)



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
)
def post_addInfo_answer(
    data : post_addInfo_answer_Request,
    db : Session = Depends(get_db)
) : 

    success = post_addInfo_answer_crud(data , db)

    if not success :
        raise HTTPException(status_code=404 , detail="uid Not Exists")
    else :
        return {
            "msg" : "Success"
        }