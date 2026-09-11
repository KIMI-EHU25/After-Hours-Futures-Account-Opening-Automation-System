from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.bussiness_models import User , launderingBackAnswer , addInfoAnswer , questionAnswer , chooseFuturesAnswer


def answer_to_dict(answer):
    if answer is None:
        return None

    return {
        column.name: getattr(answer, column.name)
        for column in answer.__table__.columns
        if column.name not in {"serial_number", "uid", "ans_created_at"}
    }



def get_jsinject_data(
    uid : int,
    db : Session
) : 

    user = db.execute(
        select(User).where(
            User.uid == uid
        )
    ).scalar_one_or_none()

    if user is None : 
        return None

    launderingBack = db.execute(
        select(launderingBackAnswer).where(
            launderingBackAnswer.uid == uid
        ).order_by(
            launderingBackAnswer.serial_number.desc()
        )
    ).scalars().first()

    addInfo = db.execute(
        select(addInfoAnswer).where(
            addInfoAnswer.uid == uid
        ).order_by(
            addInfoAnswer.serial_number.desc()
        )
    ).scalars().first()

    question = db.execute(
        select(questionAnswer).where(
            questionAnswer.uid == uid
        ).order_by(
            questionAnswer.serial_number.desc()
        )
    ).scalars().first()

    chooseFutures = db.execute(
        select(chooseFuturesAnswer).where(
            chooseFuturesAnswer.uid == uid
        ).order_by(
            chooseFuturesAnswer.serial_number.desc()
        )
    ).scalars().first()

    obj = {
        "launderingBack": answer_to_dict(launderingBack),
        "addInfo": answer_to_dict(addInfo),
        "question": answer_to_dict(question),
        "chooseFutures": answer_to_dict(chooseFutures),
    }

    return obj