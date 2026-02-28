from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from src.db.database import get_db
from src.core.config import settings
from src.core.exceptions import CredentialsException
from src.services.user_service import get_user_by_username
from src.db.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/users/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise CredentialsException()
    except JWTError:
        raise CredentialsException()
        
    user = get_user_by_username(db, username=username)
    if user is None:
        raise CredentialsException()
    return user