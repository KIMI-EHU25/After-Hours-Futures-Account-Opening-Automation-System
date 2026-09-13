from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.code_schemas import province_code_Response , city_code_Response , occupation_code_Response , educationalqualification_code_Response

from app.cruds.code_cruds import get_province_code as get_province_code_crud
from app.cruds.code_cruds import get_city_code as get_city_code_crud
from app.cruds.code_cruds import get_occupation_code as get_occupation_code_crud
from app.cruds.code_cruds import get_educationalqualification_code as get_educationalqualification_code_crud


router = APIRouter(
    prefix="/api/code",
    tags=["code"]
)


@router.get(
    "/province",
    response_model=list[province_code_Response]
)
def get_province_code(
    db : Session = Depends(get_db)
) :
    province_codes = get_province_code_crud(db)

    return province_codes



@router.get(
    "/city",
    response_model=list[city_code_Response]
)
def get_city_code(
    db : Session = Depends(get_db)
) :
    city_codes = get_city_code_crud(db)

    return city_codes



@router.get(
    "/occupation",
    response_model=list[occupation_code_Response]
)
def get_occupation_code(
    db : Session = Depends(get_db)
) : 
    occupation_codes = get_occupation_code_crud(db)

    return occupation_codes



@router.get(
    "/educationalqualification",
    response_model=list[educationalqualification_code_Response]
)
def get_educationalqualification_code(
    db : Session = Depends(get_db)
) : 
    educationalqualification_codes = get_educationalqualification_code_crud(db)

    return educationalqualification_codes