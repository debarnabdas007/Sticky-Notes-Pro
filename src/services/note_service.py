from sqlalchemy.orm import Session
from src.db.models import Note
from src.schemas.note_schema import NoteCreate, NoteUpdate

def get_notes_for_user(db: Session, user_id: int):
    # Order by position_index so the frontend renders them in the exact dragged order
    return db.query(Note).filter(Note.owner_id == user_id).order_by(Note.position_index).all()

def create_note(db: Session, note: NoteCreate, user_id: int):
    db_note = Note(**note.model_dump(), owner_id=user_id)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def update_note(db: Session, note_id: int, note_update: NoteUpdate, user_id: int):
    db_note = db.query(Note).filter(Note.id == note_id, Note.owner_id == user_id).first()
    if not db_note:
        return None
    
    update_data = note_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_note, key, value)
        
    db.commit()
    db.refresh(db_note)
    return db_note

def delete_note(db: Session, note_id: int, user_id: int):
    db_note = db.query(Note).filter(Note.id == note_id, Note.owner_id == user_id).first()
    if db_note:
        db.delete(db_note)
        db.commit()
        return True
    return False