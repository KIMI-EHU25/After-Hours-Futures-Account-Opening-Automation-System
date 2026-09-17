from datetime import datetime , timezone , timedelta
from pwdlib import PasswordHash
from dotenv import load_dotenv
import os
import jwt
import secrets
import hashlib

load_dotenv()

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"])
REFRESH_TOKEN_EXPIRE_DAYS = int(os.environ["REFRESH_TOKEN_EXPIRE_DAYS"])
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = "HS256"

password_hash = PasswordHash.recommended()

def create_access_token(user_id : int) -> str :
    expire_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub" : str(user_id),
        "exp" : expire_at
    }
    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def create_refresh_token() -> str :
    return secrets.token_hex(32)

def hash_refresh_token(refresh_token : str) -> str :
    return hashlib.sha256(refresh_token.encode("utf-8")).hexdigest()

def get_refresh_token_expire_at() -> datetime:
    return datetime.now(timezone.utc) + timedelta(
        days=REFRESH_TOKEN_EXPIRE_DAYS
    )