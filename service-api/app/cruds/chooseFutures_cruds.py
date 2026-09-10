from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.config_models import chooseFuturesTitle , chooseFuturesOption


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