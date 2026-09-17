from pydantic import BaseModel

class OptionResponse(BaseModel) :
    question_code : int
    option : str
    optiontext : str

    model_config = {
        "from_attributes": True
    }

class TitleResponse(BaseModel) :
    question_code : int
    type : str
    title : str
    options : list[OptionResponse]

    model_config = {
        "from_attributes": True
    }

class MessageResponse(BaseModel) :
    msg : str