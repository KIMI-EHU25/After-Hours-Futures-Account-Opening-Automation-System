from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.code_models import ProvinceCode , CityCode , OccupationCode , EducationalQualificationCode

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



def get_occupation_code(
        db : Session
) : 
    occupation_codes = db.execute(
        select(OccupationCode)
    ).scalars().all()

    return occupation_codes



def get_educationalqualification_code(
    db : Session
) : 
    educationalqualification_codes = db.execute(
        select(EducationalQualificationCode)
    ).scalars().all()

    return educationalqualification_codes
