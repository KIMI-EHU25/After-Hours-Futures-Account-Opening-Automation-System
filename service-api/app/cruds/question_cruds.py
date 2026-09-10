from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.config_models import questionTitle , questionOption


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