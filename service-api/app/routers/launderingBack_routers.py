from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.shared_schemas import TitleResponse
from app.cruds.launderingBack_cruds import get_launderingBack_config as get_launderingBack_config_crud



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