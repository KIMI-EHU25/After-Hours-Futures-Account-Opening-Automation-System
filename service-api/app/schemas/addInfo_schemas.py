from pydantic import BaseModel

class FieldResponse(BaseModel) :
    field_id : int
    field_name : str
    type : str