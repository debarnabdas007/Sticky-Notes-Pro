from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from src.db.database import get_db
from src.schemas.note_schema import NoteCreate, NoteUpdate, NoteResponse
from src.services import note_service
from src.api.dependencies import get_current_user
from src.db.models import User

router = APIRouter()

@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(note: NoteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return note_service.create_note(db=db, note=note, user_id=current_user.id)

@router.get("/", response_model=List[NoteResponse])
def read_notes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return note_service.get_notes_for_user(db=db, user_id=current_user.id)

@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note: NoteUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    updated_note = note_service.update_note(db=db, note_id=note_id, note_update=note, user_id=current_user.id)
    if updated_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return updated_note

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = note_service.delete_note(db=db, note_id=note_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")
    return None