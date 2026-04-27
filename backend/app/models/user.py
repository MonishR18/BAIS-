from dataclasses import dataclass
from uuid import UUID, uuid4


@dataclass(frozen=True)
class User:
    id: UUID
    email: str
    hashed_password: str

    @staticmethod
    def create(*, email: str, hashed_password: str) -> "User":
        return User(id=uuid4(), email=email, hashed_password=hashed_password)
