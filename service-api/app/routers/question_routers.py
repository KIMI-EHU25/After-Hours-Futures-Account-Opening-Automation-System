from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.shared_schemas import TitleResponse
from app.cruds.question_cruds import get_question_config as get_question_config_crud



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