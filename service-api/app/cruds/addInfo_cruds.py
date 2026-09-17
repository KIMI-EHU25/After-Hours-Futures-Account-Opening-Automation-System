from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.config_models import addInfoTitle
from app.models.bussiness_models import User , addInfoAnswer
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