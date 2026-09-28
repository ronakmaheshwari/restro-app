from pwdlib import PasswordHash
from core.config import settings

password_hash = PasswordHash.recommended()

def hash_password(password: str) -> str:
    return password_hash.hash(password, salt=settings.salt_round)

def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)