from pydantic import BaseModel

class province_code_Response(BaseModel) : 
    province_code : str
    name : str


class city_code_Response(BaseModel) : 
    province_code : str
    city_code : str
    name : str


class occupation_code_Response(BaseModel) : 
    occupation_code : str
    name : str


class educationalqualification_code_Response(BaseModel) : 
    educationalqualification_code : str
    name : str