import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    database_url: str
    salt_round: int = 10
    db_echo: bool = False
    jwt_secret: str
    jwt_algorithm: str
    jwt_expire_minutes: int = 30

    class Config:
        env_file = ".env"

settings = Settings()