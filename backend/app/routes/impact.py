from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.base import User, FermentationBatch
from app.schemas.base import APIResponse
from app.services.environmental_impact import EnvironmentalImpactService

router = APIRouter(prefix="/api/v1", tags=["impact"])

@router.get("/impact/user", response_model=APIResponse)
async def get_user_impact(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    impact_data = EnvironmentalImpactService.calculate_user_impact(db, current_user.id)
    
    return APIResponse(
        status="success",
        message="Dampak lingkungan pengguna berhasil diambil",
        data=impact_data
    )

@router.get("/batches/{batch_id}/impact", response_model=APIResponse)
async def get_batch_impact(
    batch_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    batch = db.query(FermentationBatch).filter(
        FermentationBatch.id == batch_id,
        FermentationBatch.user_id == current_user.id
    ).first()
    
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch tidak ditemukan")
        
    waste_weight_kg = batch.waste_weight_kg if batch.waste_weight_kg else 0.0
    impact_data = EnvironmentalImpactService.calculate_batch_impact(waste_weight_kg)
    
    return APIResponse(
        status="success",
        message="Dampak lingkungan batch berhasil diambil",
        data=impact_data
    )
