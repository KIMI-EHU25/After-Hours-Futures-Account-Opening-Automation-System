from fastapi import HTTPException , status
from sqlalchemy.orm import Session
from sqlalchemy import select , or_
from sqlalchemy.exc import IntegrityError

from app.security import password_hash
from app.schemas.auth_schemas import RegisterRequest , LoginRequest
from app.models.bussiness_models import User , RefreshToken
from app.security import create_access_token , create_refresh_token , hash_refresh_token , get_refresh_token_expire_at


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
        raise HTTPException(status_code=status.HTTP_409_CONFLICT , detail="手机号或身份证号已存在")
    
    user = User(
        user_phone = data.user_phone,
        user_id = data.user_id,
        user_hashed_password = password_hash.hash(data.user_password)
    )

    db.add(user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="手机号或身份证号已存在",
        )
    db.commit()

    
    db.refresh(user)
    return user



def login(
    data : LoginRequest,
    db : Session
) : 
    user = db.execute(
        select(User).where(
            User.user_phone == data.user_phone
        )
    ).scalar_one_or_none()

    if user is None or not password_hash.verify(data.user_password , user.user_hashed_password) : 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={
                "WWW-Authenticate" : "Bearer"
            }
        )

    access_token = create_access_token(user.uid)
    refresh_token = create_refresh_token()

    payload = {
        "access_token" : access_token,
        "refresh_token" : refresh_token,
        "token_type" : "bearer"
    }

    rt = RefreshToken(
        hashed_token = hash_refresh_token(refresh_token),
        uid = user.uid,
        expire_at = get_refresh_token_expire_at()
    )

    db.add(rt)
    db.commit()

    return payload