from typing import Literal
from pydantic import BaseModel

ChoiceAB = Literal["A", "B"]
ChoiceABC = Literal["A", "B", "C"]
ChoiceABCDE = Literal["A", "B", "C", "D", "E"]
ChoiceABCDEFGHI = Literal["A", "B", "C", "D", "E", "F", "G", "H", "I"]
MultipleChoiceABC = Literal["A", "B", "C", "AB", "AC", "BC", "ABC"]

class post_launderingBack_answer_Request(BaseModel) :
    p1 : ChoiceABC
    p2 : ChoiceABCDE
    p3 : ChoiceABC
    p4 : ChoiceABC
    p5 : ChoiceAB
    p6 : ChoiceAB
    p7 : MultipleChoiceABC
    p8 : ChoiceABCDEFGHI
    p9 : MultipleChoiceABC
