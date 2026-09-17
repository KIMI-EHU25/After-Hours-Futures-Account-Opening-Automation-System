from fastapi.security import HTTPBearer , HTTPAuthorizationCredentials
from fastapi import Depends , HTTPException , status
from sqlalchemy import select
from sqlalchemy.orm import Session
import jwt
from jwt.exceptions import InvalidTokenError

from app.database import get_db
from app.security import SECRET_KEY , ALGORITHM
from app.models.bussiness_models import User

# 请求头验证用户身份
def get_current_user(
    credentials : HTTPAuthorizationCredentials = Depends(HTTPBearer()),
    db : Session = Depends(get_db)
) -> User :
    try :
        data = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        uid = jwt.get("sub")
        if uid is None :
            raise ValueError()
        uid = int(uid)

        user = db.execute(
            select(User).where(
                User.uid == uid
            )
        ).scalar_one_or_none()

        if user is None :
            raise ValueError()

        return user

    except (InvalidTokenError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access Token 无效",
            headers={
                "WWW-Authenticate" : "bearer"
            }
        )


def require_admin(
    current_user : User = Depends(get_current_user)
) -> User :
    if not current_user.is_admin : 
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )

    return current_user