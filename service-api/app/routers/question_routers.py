from fastapi import APIRouter , Depends , HTTPException , status
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.shared_schemas import TitleResponse , MessageResponse
from app.schemas.question_schemas import post_question_answer_Request
from app.cruds.question_cruds import (
    get_question_config as get_question_config_crud,
    post_question_answer as post_question_answer_crud
)



router = APIRouter(
    prefix="/api/question",
    tags=["question"]
)



@router.get(
    "/config",
    response_model=list[TitleResponse]
)
def get_question_config(
    db : Session = Depends(get_db)
) :
    return get_question_config_crud(db)



@router.post(
    "/answer",
    response_model=MessageResponse
)
def post_question_answer(
    data : post_question_answer_Request,
    db : Session = Depends(get_db)
) : 

    success = post_question_answer_crud(data , db)

    if not success :
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND , detail="uid Not Exists")
    else :
        return {
            "msg" : "Success"
        }