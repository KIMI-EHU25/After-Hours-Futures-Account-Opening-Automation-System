from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.shared_schemas import TitleResponse
from app.schemas.chooseFutures_schemas import post_chooseFutures_answer_Request
from app.cruds.chooseFutures_cruds import get_chooseFutures_config as get_chooseFutures_config_crud
from app.cruds.chooseFutures_cruds import post_chooseFutures_answer as post_chooseFutures_answer_crud



router = APIRouter(
    prefix="/api/chooseFutures",
    tags=["chooseFutures"]
)



@router.get(
    "/config",
    response_model=list[TitleResponse]
)
def get_chooseFutures_config(
    db : Session = Depends(get_db)
) : 
    return get_chooseFutures_config_crud(db)



@router.post(
    "/answer",
)
def post_chooseFutures_answer(
    data : post_chooseFutures_answer_Request,
    db : Session = Depends(get_db)
) : 

    success = post_chooseFutures_answer_crud(data , db)

    if not success :
        raise HTTPException(status_code=404 , detail="uid Not Exists")
    else :
        return {
            "msg" : "Success"
        }