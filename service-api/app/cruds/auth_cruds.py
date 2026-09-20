from datetime import datetime, timezone
from fastapi import HTTPException , status
from sqlalchemy import select , or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.bussiness_models import User , RefreshToken
from app.schemas.auth_schemas import RegisterRequest , LoginRequest , RefreshRequest , LogoutRequest
from app.security import (
    create_access_token,
    create_refresh_token,
    get_refresh_token_expire_at,
    hash_refresh_token,
    password_hash,
)


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

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="登录状态保存失败",
        )

    return payload



def refresh(
    data : RefreshRequest , 
    db : Session
) : 
    httpexception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh Token 无效",
        headers={
            "WWW-Authenticate" : "Bearer"
        }
    )
    
    refresh_token = data.refresh_token
    hashed_token = hash_refresh_token(refresh_token)

    rt = db.execute(
        select(RefreshToken).where(
            RefreshToken.hashed_token == hashed_token
        )
    ).scalar_one_or_none()

    if rt is None :
        raise httpexception

    user = db.execute(
        select(User).where(
            User.uid == rt.uid
        )
    ).scalar_one_or_none()

    if user is None or not rt.is_active or rt.expire_at <= datetime.now(timezone.utc) : 
        raise httpexception

    access_token = create_access_token(user.uid)

    payload = {
        "access_token" : access_token,
        "token_type" : "bearer"
    }

    return payload



def logout(
    data : LogoutRequest , 
    current_user : User , 
    db : Session
) : 
    httpexception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh Token 无效",
        headers={
            "WWW-Authenticate" : "Bearer"
        }
    )
    
    refresh_token = db.execute(
        select(RefreshToken).where(
            RefreshToken.hashed_token == hash_refresh_token(data.refresh_token)
        )
    ).scalar_one_or_none()

    if refresh_token is None : 
        raise httpexception

    if not refresh_token.is_active or refresh_token.expire_at <= datetime.now(timezone.utc):
        raise httpexception

    refresh_token_user = db.execute(
        select(User).where(
            User.uid == refresh_token.uid
        )
    ).scalar_one_or_none()

    if refresh_token_user is None : 
        raise httpexception

    if not refresh_token_user.uid == current_user.uid : 
        raise httpexception

    refresh_token.is_active = False
    db.commit()
    return {
        "msg" : "Success"
    }