from typing import Literal
from pydantic import BaseModel

ChoiceAB = Literal["A", "B"]
ChoiceABCD = Literal["A", "B", "C", "D"]
ChoiceABCDE = Literal["A", "B", "C", "D", "E"]

class post_question_answer_Request(BaseModel) :
    p1 : ChoiceAB
    p2 : ChoiceABCDE
    p3 : ChoiceABCD
    p4 : ChoiceABCD
    p5 : ChoiceABCD
    p6 : ChoiceABCD
    p7 : ChoiceABCD
    p8 : ChoiceABCD
    p9 : ChoiceABCD
    p10 : ChoiceABCD
    p11 : ChoiceABCD
    p12 : ChoiceABCDE
    p13 : ChoiceABCDE
    p14 : ChoiceABCD
