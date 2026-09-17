from pydantic import BaseModel , Field

class post_chooseFutures_answer_Request(BaseModel) : 
    p1 : str = Field(min_length=1 , max_length=4)