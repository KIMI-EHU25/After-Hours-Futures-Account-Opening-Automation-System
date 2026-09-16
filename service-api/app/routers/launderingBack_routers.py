from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.shared_schemas import TitleResponse
from app.schemas.launderingBack_schemas import post_launderingBack_answer_Request
from app.cruds.launderingBack_cruds import (
    get_launderingBack_config as get_launderingBack_config_crud,
    post_launderingBack_answer as post_launderingBack_answer_crud
)



router = APIRouter(
    prefix="/api/launderingBack",
    tags=["launderingBack"]
)



@router.get(
    "/config",
    response_model=list[TitleResponse]
)
def get_launderingBack_config(
    db : Session = Depends(get_db)
) :
    return get_launderingBack_config_crud(db)



@router.post(
    "/answer",
)
def post_launderingBack_answer(
    data : post_launderingBack_answer_Request,
    db : Session = Depends(get_db)
) : 

    success = post_launderingBack_answer_crud(data , db)

    if not success :
        raise HTTPException(status_code=404 , detail="uid Not Exists")
    else :
        return {
            "msg" : "Success"
        }