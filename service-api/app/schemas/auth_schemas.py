from pydantic import BaseModel , Field

class RegisterRequest(BaseModel) : 
    user_phone : str
    user_id : str
    user_password: str = Field(min_length=8, max_length=128)

class RegisterResponse(BaseModel) : 
    uid : int
    user_phone : str
    user_id : str
    is_admin : bool

    model_config = {
        "from_attributes": True
    }