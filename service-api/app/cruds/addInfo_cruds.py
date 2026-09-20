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
            ProvinceCode.province_code == data.p7
        )
    )
    if province_exists is None :
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="联系地址省份代码不存在"
        )

    city_exists = db.scalar(
        select(CityCode.city_code).where(
            CityCode.province_code == data.p7,
            CityCode.city_code == data.p8
        )
    )
    if city_exists is None :
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="联系地址城市代码不存在或与省份不匹配"
        )

    occupation_exists = db.scalar(
        select(OccupationCode.occupation_code).where(
            OccupationCode.occupation_code == data.p17
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
            == data.p18
        )
    )
    if educational_qualification_exists is None :
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="学历代码不存在"
        )

    addInfoanswer = addInfoAnswer(
        uid = current_user.uid,
        p1 = data.p1,
        p2 = data.p2,
        p3 = data.p3,
        p4 = data.p4,
        p5 = data.p5,
        p6 = data.p6,
        p7 = data.p7,
        p8 = data.p8,
        p9 = data.p9,
        p10 = data.p10,
        p11 = data.p11,
        p12 = data.p12,
        p13 = data.p13,
        p14 = data.p14,
        p15 = data.p15,
        p16 = data.p16,
        p17 = data.p17,
        p18 = data.p18,
        p19 = data.p19,
        p20 = data.p20,
        p21 = data.p21,
        p22 = data.p22,
        p23 = data.p23
    )

    db.add(addInfoanswer)
    db.commit()
    db.refresh(addInfoanswer)

    return {
        "msg" : "Success"
    }
