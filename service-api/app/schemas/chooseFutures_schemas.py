from typing import Literal
from pydantic import BaseModel

MultipleChoiceABCD = Literal[
    "A", "B", "C", "D",
    "AB", "AC", "AD", "BC", "BD", "CD",
    "ABC", "ABD", "ACD", "BCD",
    "ABCD",
]

class post_chooseFutures_answer_Request(BaseModel) : 
    p1 : MultipleChoiceABCD
