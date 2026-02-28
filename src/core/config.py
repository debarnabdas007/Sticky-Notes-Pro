from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sticky Note App"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security (In production, these should be in a .env file)
    SECRET_KEY: str = "a_super_secret_key_change_this_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str 

    class Config:
        case_sensitive = True

settings = Settings()