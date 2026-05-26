from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    nombre: str
    apellido: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    nombre: str
    apellido: str
    roles: list[str]  # list of rol codigos


class TokenData(BaseModel):
    user_id: int
    email: str
    roles: list[str]
