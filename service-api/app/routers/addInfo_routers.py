from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.addInfo_schemas import FieldResponse
from app.cruds.addInfo_cruds import get_addInfo_config as get_addInfo_config_crud



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