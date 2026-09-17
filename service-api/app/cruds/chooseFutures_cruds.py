from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.config_models import chooseFuturesTitle , chooseFuturesOption
from app.schemas.chooseFutures_schemas import post_chooseFutures_answer_Request
from app.models.bussiness_models import User , chooseFuturesAnswer


def get_chooseFutures_config(
    db : Session
) : 
    ret = []

    titles = db.execute(select(chooseFuturesTitle)).scalars().all()

    for title in titles :
        
        options = db.execute(
            select(chooseFuturesOption).where(
                chooseFuturesOption.question_code == title.question_code
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



def post_chooseFutures_answer(
    data : post_chooseFutures_answer_Request,
    current_user : User,
    db : Session
) : 
    chooseFuturesanswer = chooseFuturesAnswer(
        uid = current_user.uid,
        p1 = data.p1
    )

    db.add(chooseFuturesanswer)
    db.commit()
    db.refresh(chooseFuturesanswer)

    return {
        "msg" : "Success"
    }