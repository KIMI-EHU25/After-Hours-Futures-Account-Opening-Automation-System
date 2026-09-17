import re
from datetime import date, datetime
from typing import Annotated, Self
from pydantic import BaseModel, EmailStr, StringConstraints, field_validator, model_validator


NonEmptyString = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1)
]
MobileNumber = Annotated[
    str,
    StringConstraints(strip_whitespace=True, pattern=r"^1[3-9]\d{9}$")
]
PostalCode = Annotated[
    str,
    StringConstraints(strip_whitespace=True, pattern=r"^\d{6}$")
]

class FieldResponse(BaseModel) :
    field_id : int
    field_name : str
    type : str

    model_config = {
        "from_attributes": True
    }

class post_addInfo_answer_Request(BaseModel) :
    name : NonEmptyString
    idCardNumber : NonEmptyString
    idCardAddress : NonEmptyString
    idCardValidPeriodStart : date | None = None   # 前端可以传 null 或不传这个字段
    idCardValidPeriodEnd : date | None = None
    ifIdCardPermanentlyValid : bool
    contactAddressProvince : NonEmptyString
    contactAddressCity : NonEmptyString
    contactAddress : NonEmptyString
    postalCode : PostalCode
    departmentProvince : NonEmptyString
    departmentCity : NonEmptyString
    departmentCategory : NonEmptyString
    departmentName : NonEmptyString
    contactnumber : MobileNumber
    emailAddress : EmailStr | None = None
    occupation : NonEmptyString
    educationalQualification : NonEmptyString
    ifIntermediary : bool
    intermediaryName : NonEmptyString | None = None
    intermediaryCode : NonEmptyString | None = None
    referencePersonCode : NonEmptyString | None = None
    referencePersonName : NonEmptyString | None = None

    @field_validator("idCardNumber")
    @classmethod
    def validate_id_card_number(cls, value : str) -> str :
        normalized_value = value.upper()

        if re.fullmatch(r"[1-9]\d{16}[\dX]", normalized_value) is None :
            raise ValueError("身份证号码格式不正确")

        try :
            datetime.strptime(normalized_value[6:14], "%Y%m%d")
        except ValueError as exc :
            raise ValueError("身份证号码中的出生日期不正确") from exc

        weights = (7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2)
        check_codes = "10X98765432"
        weighted_sum = sum(
            int(number) * weight
            for number, weight in zip(normalized_value[:17], weights)
        )
        expected_check_code = check_codes[weighted_sum % 11]

        if normalized_value[-1] != expected_check_code :
            raise ValueError("身份证号码校验位不正确")

        return normalized_value

    @model_validator(mode="after")
    def validate_related_fields(self) -> Self :
        if self.ifIdCardPermanentlyValid :
            if (
                self.idCardValidPeriodStart is not None
                or self.idCardValidPeriodEnd is not None
            ) :
                raise ValueError("身份证长期有效时，有效期开始和结束日期必须为空")
        else :
            if (
                self.idCardValidPeriodStart is None
                or self.idCardValidPeriodEnd is None
            ) :
                raise ValueError("身份证非长期有效时，有效期开始和结束日期均为必填")

            if self.idCardValidPeriodEnd <= self.idCardValidPeriodStart :
                raise ValueError("身份证有效期结束日期必须晚于开始日期")

        if self.ifIntermediary :
            if self.intermediaryName is None or self.intermediaryCode is None :
                raise ValueError("存在居间人时，居间人姓名和代码均为必填")
        elif self.intermediaryName is not None or self.intermediaryCode is not None :
            raise ValueError("不存在居间人时，居间人姓名和代码必须为空")

        return self
