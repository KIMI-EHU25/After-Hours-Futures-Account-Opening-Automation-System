from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.code_models import ProvinceCode , CityCode

def get_province_code(
    db : Session
) : 
    province_codes = db.execute(
        select(ProvinceCode)
    ).scalars().all()

    return province_codes


def get_city_code(
    db : Session
) : 
    city_codes = db.execute(
        select(CityCode)
    ).scalars().all()

    return city_codes