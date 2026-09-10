from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.config_models import addInfoTitle


def get_addInfo_config(
    db : Session
) :

    titles = db.execute(select(addInfoTitle)).scalars().all()

    titles.sort(key=lambda obj : obj.field_id)

    return titles