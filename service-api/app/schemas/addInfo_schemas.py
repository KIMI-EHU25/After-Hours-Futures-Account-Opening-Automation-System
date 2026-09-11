from pydantic import BaseModel
from datetime import date

class FieldResponse(BaseModel) :
    field_id : int
    field_name : str
    type : str

    model_config = {
        "from_attributes": True
    }



class post_addInfo_answer_Request(BaseModel) :
    uid : int
    name : str
    idCardNumber : str
    idCardAddress : str
    idCardValidPeriodStart : date | None = None   # 前端可以传 null 或不传这个字段
    idCardValidPeriodEnd : date | None = None
    ifIdCardPermanentlyValid : bool
    contactAddressProvince : str
    contactAddressCity : str
    contactAddress : str
    postalCode : str
    departmentProvince : str
    departmentCity : str
    departmentCategory : str
    departmentName : str
    contactnumber : str
    emailAddress : str | None = None
    occupation : str
    educationalQualification : str
    ifIntermediary : bool
    intermediaryName : str | None = None
    intermediaryCode : str | None = None
    referencePersonCode : str | None = None
    referencePersonName : str | None = None
