from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.base import User
from app.schemas.base import APIResponse

router = APIRouter(prefix="/api/v1/users", tags=["users"])


class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=30)
    avatar_url: Optional[str] = Field(None, max_length=500)


@router.get("/me", response_model=APIResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return APIResponse(
        status="success",
        data={
            "id": current_user.id,
            "email": current_user.email or "",
            "name": current_user.name or "",
            "phone": current_user.phone or "",
            "avatar_url": getattr(current_user, "avatar_url", None) or "",
            "role": current_user.role,
        },
    )


@router.patch("/me", response_model=APIResponse)
async def update_me(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.name is not None and payload.name.strip():
        current_user.name = payload.name.strip()
    if payload.phone is not None:
        current_user.phone = payload.phone.strip() or None
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url.strip() or None
    db.commit()
    db.refresh(current_user)
    return APIResponse(
        status="success",
        message="Profil diperbarui",
        data={
            "id": current_user.id,
            "email": current_user.email or "",
            "name": current_user.name or "",
            "phone": current_user.phone or "",
            "avatar_url": getattr(current_user, "avatar_url", None) or "",
            "role": current_user.role,
        },
    )