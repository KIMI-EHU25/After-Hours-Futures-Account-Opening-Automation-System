from pydantic import BaseModel , Field , ConfigDict

class RegisterRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_phone: str = Field(
        min_length=11,
        max_length=20,
        pattern=r"^\d+$",
    )
    user_id: str = Field(
        min_length=18,
        max_length=18,
        pattern=r"^\d{17}[\dXx]$",
    )
    user_password: str = Field(
        min_length=8,
        max_length=128,
    )

class RegisterResponse(BaseModel) : 
    uid : int
    user_phone : str
    is_admin : bool

    model_config = {
        "from_attributes": True
    }

class LoginRequest(BaseModel) :
    user_phone: str = Field(
        min_length=11,
        max_length=20,
        pattern=r"^\d+$",
    )
    user_password: str = Field(min_length=8, max_length=128)

class LoginResponse(BaseModel) : 
    access_token : str
    refresh_token : str
    token_type : str = "bearer"

    model_config = {
        "from_attributes": True
    }

class RefreshRequest(BaseModel):
    refresh_token: str = Field(
        min_length=64,
        max_length=64,
        pattern=r"^[0-9a-f]+$",
    )

class RefreshResponse(BaseModel) : 
    access_token : str
    token_type : str = "bearer"

    model_config = {
        "from_attributes": True
    }