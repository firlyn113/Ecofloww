from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.base import User, FermentationBatch, ProductTemplate, RoadmapProgress
from app.schemas.base import APIResponse, RoadmapCreate, RoadmapUpdate
from app.services.roadmap import RoadmapService
from app.services.report import ReportService

router = APIRouter(prefix="/api/v1", tags=["roadmap"])

@router.post("/batches/{batch_id}/roadmap", response_model=APIResponse)
async def create_roadmap(
    batch_id: int,
    roadmap_req: RoadmapCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    batch = db.query(FermentationBatch).filter(
        FermentationBatch.id == batch_id,
        FermentationBatch.user_id == current_user.id
    ).first()
    
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")
        
    existing_roadmap = db.query(RoadmapProgress).filter(RoadmapProgress.batch_id == batch_id).first()
    if existing_roadmap:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Roadmap already exists for this batch")
        
    try:
        generated_data = RoadmapService.generate_roadmap(roadmap_req.product_template_id, db)
        
        new_roadmap = RoadmapProgress(
            batch_id=batch_id,
            product_template_id=roadmap_req.product_template_id,
            user_id=current_user.id,
            steps_json=generated_data["steps"],
            status="not_started",
            current_step=0
        )
        db.add(new_roadmap)
        db.commit()
        db.refresh(new_roadmap)
        
        return APIResponse(
            status="success",
            message="Roadmap created successfully",
            data=RoadmapService.get_progress_summary(new_roadmap)
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/batches/{batch_id}/roadmap", response_model=APIResponse)
async def get_roadmap(
    batch_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    roadmap = db.query(RoadmapProgress).filter(
        RoadmapProgress.batch_id == batch_id,
        RoadmapProgress.user_id == current_user.id
    ).first()
    
    if not roadmap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap not found")
        
    return APIResponse(
        status="success",
        data=RoadmapService.get_progress_summary(roadmap)
    )

@router.get("/batches/{batch_id}/roadmap/report")
async def download_roadmap_report(
    batch_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    roadmap = db.query(RoadmapProgress).filter(
        RoadmapProgress.batch_id == batch_id,
        RoadmapProgress.user_id == current_user.id,
    ).first()
    if not roadmap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap not found")
    content = ReportService.generate_roadmap_pdf(
        batch_id,
        {
            "template_name": roadmap.template.name if roadmap.template else "Eco-Enzyme Product",
            "steps": roadmap.steps_json,
            "safety_warnings": roadmap.template.safety_warnings if roadmap.template else "Follow safe handling practices.",
            "tutorial_url": roadmap.template.tutorial_url if roadmap.template else None,
        },
    )
    return Response(
        content=content,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="roadmap-batch-{batch_id}.pdf"'},
    )

@router.put("/batches/{batch_id}/roadmap/steps/{step_index}", response_model=APIResponse)
async def update_roadmap_step(
    batch_id: int,
    step_index: int,
    update_req: RoadmapUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    roadmap = db.query(RoadmapProgress).filter(
        RoadmapProgress.batch_id == batch_id,
        RoadmapProgress.user_id == current_user.id
    ).first()
    
    if not roadmap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap not found")
        
    try:
        summary = RoadmapService.update_step_status(roadmap, step_index, update_req.completed, db)
        return APIResponse(
            status="success",
            message="Step updated successfully",
            data=summary
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/roadmap/templates/{template_id}", response_model=APIResponse)
async def get_roadmap_template(
    template_id: int,
    db: Session = Depends(get_db)
):
    try:
        data = RoadmapService.generate_roadmap(template_id, db)
        return APIResponse(
            status="success",
            data=data
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
