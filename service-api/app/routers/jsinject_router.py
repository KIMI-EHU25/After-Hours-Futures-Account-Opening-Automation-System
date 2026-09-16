from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.jsinject_schemas import get_jsinject_data_Response
from app.cruds.jsinject_cruds import get_jsinject_data as get_jsinject_data_crud



router = APIRouter(
    prefix="/api/jsinject",
    tags=["jsinject"]
)



@router.get(
    "/data",
    response_model=get_jsinject_data_Response
)
def get_jsinject_data(
    uid : int,
    db : Session = Depends(get_db)
) : 

    data = get_jsinject_data_crud(uid , db)

    if data is None : 
        raise HTTPException(status_code=404 , detail="uid Not Exists")

    return data