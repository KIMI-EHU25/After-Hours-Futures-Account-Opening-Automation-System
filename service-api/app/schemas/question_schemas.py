from pydantic import BaseModel , Field

class post_question_answer_Request(BaseModel) :
    p1 : str = Field(min_length=1, max_length=1)
    p2 : str = Field(min_length=1, max_length=1)
    p3 : str = Field(min_length=1, max_length=1)
    p4 : str = Field(min_length=1, max_length=1)
    p5 : str = Field(min_length=1, max_length=1)
    p6 : str = Field(min_length=1, max_length=1)
    p7 : str = Field(min_length=1, max_length=1)
    p8 : str = Field(min_length=1, max_length=1)
    p9 : str = Field(min_length=1, max_length=1)
    p10 : str = Field(min_length=1, max_length=1)
    p11 : str = Field(min_length=1, max_length=1)
    p12 : str = Field(min_length=1, max_length=1)
    p13 : str = Field(min_length=1, max_length=1)
    p14 : str = Field(min_length=1, max_length=1)