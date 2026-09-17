from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.bussiness_models import User , addInfoAnswer
from app.models.code_models import (
    CityCode,
    EducationalQualificationCode,
    OccupationCode,
    ProvinceCode
)
from app.models.config_models import addInfoTitle
from app.schemas.addInfo_schemas import post_addInfo_answer_Request


def get_addInfo_config(
    db : Session
) :

    titles = db.execute(select(addInfoTitle)).scalars().all()

    titles.sort(key=lambda obj : obj.field_id)

    return titles



def post_addInfo_answer(
    data : post_addInfo_answer_Request,
    current_user : User,
    db : Session
) :
    province_exists = db.scalar(
        select(ProvinceCode.province_code).where(
            ProvinceCode.province_code == data.contactAddressProvince
        )
    )
    if province_exists is None :
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="联系地址省份代码不存在"
        )

    city_exists = db.scalar(
        select(CityCode.city_code).where(
            CityCode.province_code == data.contactAddressProvince,
            CityCode.city_code == data.contactAddressCity
        )
    )
    if city_exists is None :
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="联系地址城市代码不存在或与省份不匹配"
        )

    occupation_exists = db.scalar(
        select(OccupationCode.occupation_code).where(
            OccupationCode.occupation_code == data.occupation
        )
    )
    if occupation_exists is None :
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="职业代码不存在"
        )

    educational_qualification_exists = db.scalar(
        select(EducationalQualificationCode.educationalqualification_code).where(
            EducationalQualificationCode.educationalqualification_code
            == data.educationalQualification
        )
    )
    if educational_qualification_exists is None :
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="学历代码不存在"
        )

    addInfoanswer = addInfoAnswer(
        uid = current_user.uid,
        name = data.name,
        idCardNumber = data.idCardNumber,
        idCardAddress = data.idCardAddress,
        idCardValidPeriodStart = data.idCardValidPeriodStart,
        idCardValidPeriodEnd = data.idCardValidPeriodEnd,
        ifIdCardPermanentlyValid = data.ifIdCardPermanentlyValid,
        contactAddressProvince = data.contactAddressProvince,
        contactAddressCity = data.contactAddressCity,
        contactAddress = data.contactAddress,
        postalCode = data.postalCode,
        departmentProvince = data.departmentProvince,
        departmentCity = data.departmentCity,
        departmentCategory = data.departmentCategory,
        departmentName = data.departmentName,
        contactnumber = data.contactnumber,
        emailAddress = data.emailAddress,
        occupation = data.occupation,
        educationalQualification = data.educationalQualification,
        ifIntermediary = data.ifIntermediary,
        intermediaryName = data.intermediaryName,
        intermediaryCode = data.intermediaryCode,
        referencePersonCode = data.referencePersonCode,
        referencePersonName = data.referencePersonName
    )

    db.add(addInfoanswer)
    db.commit()
    db.refresh(addInfoanswer)

    return {
        "msg" : "Success"
    }
