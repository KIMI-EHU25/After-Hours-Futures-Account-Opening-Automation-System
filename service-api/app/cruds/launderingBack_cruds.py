from fastapi import HTTPException , status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.bussiness_models import User , launderingBackAnswer
from app.models.config_models import launderingBackTitle , launderingBackOption
from app.schemas.launderingBack_schemas import post_launderingBack_answer_Request


def get_launderingBack_config(
    db : Session
) :
    ret = []

    titles = db.execute(select(launderingBackTitle)).scalars().all()

    for title in titles :
        
        options = db.execute(
            select(launderingBackOption).where(
                launderingBackOption.question_code == title.question_code
            )
        ).scalars().all()

        options.sort(key=lambda obj : ord(obj.option[0]))

        obj = {
            "question_code" : title.question_code,
            "type" : title.type,
            "title" : title.title,
            "options" : options
        }

        ret.append(obj)

    ret.sort(key=lambda obj: obj["question_code"])

    return ret



def post_launderingBack_answer(
    data : post_launderingBack_answer_Request,
    current_user : User,
    db : Session
) : 
    launderingBackanswer = launderingBackAnswer(
        uid = current_user.uid,
        p1 = data.p1,
        p2 = data.p2,
        p3 = data.p3,
        p4 = data.p4,
        p5 = data.p5,
        p6 = data.p6,
        p7 = data.p7,
        p8 = data.p8,
        p9 = data.p9
    )

    db.add(launderingBackanswer)
    db.commit()
    db.refresh(launderingBackanswer)

    return {
        "msg" : "Success"
    }
