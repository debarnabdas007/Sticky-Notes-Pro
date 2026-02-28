from pydantic import BaseModel

# What we expect from the frontend when creating a user
class UserCreate(BaseModel):
    username: str
    password: str

# What we return to the frontend (notice we DO NOT return the password!)
class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True