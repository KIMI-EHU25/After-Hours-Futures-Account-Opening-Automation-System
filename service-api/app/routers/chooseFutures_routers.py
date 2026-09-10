from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.shared_schemas import TitleResponse
from app.cruds.chooseFutures_cruds import get_chooseFutures_config as get_chooseFutures_config_crud



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