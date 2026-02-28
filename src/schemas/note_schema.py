from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NoteBase(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    color_hex: Optional[str] = "#ffeb3b"
    position_index: int = 0
    due_date: Optional[datetime] = None
    is_completed: bool = False

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    color_hex: Optional[str] = None
    position_index: Optional[int] = None
    due_date: Optional[datetime] = None
    is_completed: Optional[bool] = None  # <-- This allows the frontend to update the status!

class NoteResponse(NoteBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True