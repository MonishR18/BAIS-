import os
from dotenv import load_dotenv


load_dotenv()


class Settings:
    def __init__(self) -> None:
        self.app_name: str = os.getenv(
            "APP_NAME", "Bias Analysis and Mitigation System (BAIS)"
        )
        self.api_v1_prefix: str = os.getenv("API_V1_PREFIX", "/api/v1")

        self.jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "change-me")
        self.jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
        self.access_token_expire_minutes: int = int(
            os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
        )

        allowed = os.getenv("ALLOWED_ORIGINS", "")
        self.allowed_origins: list[str] = [
            origin.strip() for origin in allowed.split(",") if origin.strip()
        ]


settings = Settings()
