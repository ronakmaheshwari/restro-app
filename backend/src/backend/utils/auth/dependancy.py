from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt
from backend.core.config import settings

oauth2_scheme = OAuth2PasswordBearer("/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme)
):
    try:
        payload = jwt.decode (
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException (
                status_code= 401,
                detail="Invalid token"
            )
        
        return user_id
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )