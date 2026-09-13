from pydantic import BaseModel

class province_code_Response(BaseModel) : 
    province_code : str
    name : str


class city_code_Response(BaseModel) : 
    province_code : str
    city_code : str
    name : str