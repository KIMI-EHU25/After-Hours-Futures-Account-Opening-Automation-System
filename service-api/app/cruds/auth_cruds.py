from fastapi import HTTPException , status
from sqlalchemy.orm import Session
from sqlalchemy import select , or_

from app.security import password_hash
from app.schemas.auth_schemas import RegisterRequest
from app.models.bussiness_models import User


def register(
    data : RegisterRequest,
    db : Session
) : 
    existing_user = db.execute(
        select(User).where(
            or_(
                User.user_phone == data.user_phone,
                User.user_id == data.user_id
            )
        )
    ).scalars().first()

    if existing_user is not None : 
        raise HTTPException(status_code=status.HTTP_409_CONFLICT , detail="手机号或邮箱已存在")
    
    user = User(
        user_phone = data.user_phone,
        user_id = data.user_id,
        user_hashed_password = password_hash.hash(data.user_password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user