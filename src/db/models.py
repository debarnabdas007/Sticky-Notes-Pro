from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from src.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Relationship to notes
    notes = relationship("Note", back_populates="owner", cascade="all, delete-orphan")

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    content = Column(Text, nullable=True)
    color_hex = Column(String, default="#ffeb3b") # Default sticky note yellow
    position_index = Column(Integer, default=0)   # For drag-and-drop ordering
    due_date = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Relationship back to user
    owner = relationship("User", back_populates="notes")