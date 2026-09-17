from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.bussiness_models import User , questionAnswer
from app.models.config_models import questionTitle , questionOption
from app.schemas.question_schemas import post_question_answer_Request


def get_question_config(
    db : Session
) : 
    ret = []

    titles = db.execute(select(questionTitle)).scalars().all()

    for title in titles :

        options = db.execute(
            select(questionOption).where(
                questionOption.question_code == title.question_code
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



def post_question_answer(
    data : post_question_answer_Request,
    current_user : User,
    db : Session
) : 
    questionanswer = questionAnswer(
        uid = current_user.uid,
        p1 = data.p1,
        p2 = data.p2,
        p3 = data.p3,
        p4 = data.p4,
        p5 = data.p5,
        p6 = data.p6,
        p7 = data.p7,
        p8 = data.p8,
        p9 = data.p9,
        p10 = data.p10,
        p11 = data.p11,
        p12 = data.p12,
        p13 = data.p13,
        p14 = data.p14
    )

    db.add(questionanswer)
    db.commit()
    db.refresh(questionanswer)

    return {
        "msg" : "Success"
    }