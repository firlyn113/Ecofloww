from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime
from collections import defaultdict, deque
import logging
import os
import time
import re
from app.core.database import get_db, engine, Base
from app.core.auth import get_current_user
from app.models.base import User, FermentationBatch, FermentationLog, ProductTemplate
from app.schemas.base import (
    FermentationBatchCreate, FermentationBatch as BatchSchema,
    FermentationLogCreate, FermentationLog as LogSchema,
    APIResponse, ErrorResponse
)
from app.services.eco_enzyme import EcoEnzymeService
from app.services.fermentation_assistant import FermentationAssistantService
from app.services.storage import upload_file_to_storage
from app.routes.recommendations import router as rec_router
from app.routes.impact import router as impact_router
from app.routes.roadmap import router as roadmap_router
from app.routes.admin import router as admin_router
from app.routes.users import router as users_router
from app.api.sensors import router as sensors_router

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="EcoFlow API", version="0.1.0")

ALLOWED_HOSTS = [h.strip() for h in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if h.strip()]
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001").split(",") if o.strip()]
RATE_LIMIT = int(os.getenv("RATE_LIMIT", "60"))
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))
REDIS_URL = os.getenv("REDIS_URL", "")

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response

rate_buckets: dict[str, deque[float]] = defaultdict(deque)

try:
    import redis as redis_client
    _redis = redis_client.from_url(REDIS_URL, socket_connect_timeout=1) if REDIS_URL else None
    if _redis:
        _redis.ping()
        logger.info("Rate limiter: Redis-backed")
except Exception as e:
    _redis = None
    logger.warning(f"Rate limiter: falling back to in-memory ({e})")

def _rate_limit_key(scope: str, identity: str) -> str:
    return f"ratelimit:{scope}:{identity}"

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    if client_ip in ("127.0.0.1", "::1", "localhost"):
        return await call_next(request)
    if _redis:
        key = _rate_limit_key("ip", client_ip)
        try:
            count = _redis.incr(key)
            if count == 1:
                _redis.expire(key, RATE_LIMIT_WINDOW)
            if count > RATE_LIMIT:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Rate limit exceeded"},
                )
        except Exception as e:
            logger.warning(f"Redis rate limit failed, allowing request: {e}")
    else:
        now = time.time()
        bucket = rate_buckets[client_ip]
        while bucket and bucket[0] <= now - RATE_LIMIT_WINDOW:
            bucket.popleft()
        if len(bucket) >= RATE_LIMIT:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded"},
            )
        bucket.append(now)
    return await call_next(request)


app.include_router(rec_router)
app.include_router(impact_router)
app.include_router(roadmap_router)
app.include_router(admin_router)
app.include_router(users_router)
app.include_router(sensors_router)


@app.post("/api/v1/upload", response_model=APIResponse)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    try:
        ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
        MAX_FILE_SIZE = 5 * 1024 * 1024
        ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
        
        if file.content_type not in ALLOWED_MIME_TYPES:
            logger.warning(f"Rejected upload: invalid MIME type {file.content_type} from user {current_user.id}")
            raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP images allowed")
        
        if file.size and file.size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large (max 5MB)")
        
        file_ext = file.filename.split('.')[-1].lower() if file.filename else ""
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Invalid file extension")
            
        url = await upload_file_to_storage(file, folder=f"users/{current_user.id}/logs")
        logger.info(f"Image uploaded successfully", extra={"user_id": current_user.id, "file_name": file.filename})
        
        return APIResponse(
            status="success",
            message="Image uploaded successfully",
            data={"url": url}
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Upload error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="File upload failed")

@app.on_event("startup")
def seed_product_templates():
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        if db.query(ProductTemplate).count() == 0:
            templates = [
                ProductTemplate(id=1, name="Household Cleaner", description="Multi-purpose eco-enzyme cleaner for household surfaces", processing_instructions="Dilute 1:10 with water. Spray on surfaces and wipe clean.", ingredients=["eco-enzyme", "water"], equipment=["spray bottle", "cloth"], time_estimate_hours=0.5, safety_warnings="Avoid contact with eyes."),
                ProductTemplate(id=2, name="Disinfectant", description="Eco-enzyme based disinfectant for sanitizing", processing_instructions="Dilute 1:5 with water. Apply to surfaces, let sit 10 minutes.", ingredients=["eco-enzyme", "water"], equipment=["spray bottle", "gloves"], time_estimate_hours=0.5, safety_warnings="Use gloves when handling concentrated solution."),
                ProductTemplate(id=3, name="Liquid Fertilizer", description="Organic liquid fertilizer from eco-enzyme", processing_instructions="Dilute 1:100 with water. Apply to soil around plants.", ingredients=["eco-enzyme", "water"], equipment=["watering can"], time_estimate_hours=0.25, safety_warnings="Do not apply to edible plant parts directly."),
                ProductTemplate(id=4, name="Pest Repellent", description="Natural pest repellent using eco-enzyme", processing_instructions="Dilute 1:10 with water. Spray on plant leaves.", ingredients=["eco-enzyme", "water"], equipment=["spray bottle"], time_estimate_hours=0.25, safety_warnings="Test on small area first."),
                ProductTemplate(id=5, name="Drain Cleaner", description="Eco-enzyme drain cleaner and deodorizer", processing_instructions="Pour undiluted into drain. Let sit overnight.", ingredients=["eco-enzyme"], equipment=["measuring cup"], time_estimate_hours=0.1, safety_warnings="Do not mix with chemical cleaners."),
                ProductTemplate(id=6, name="Odor Neutralizer", description="Natural odor neutralizer for rooms and fabrics", processing_instructions="Dilute 1:20 with water. Mist in air or on fabrics.", ingredients=["eco-enzyme", "water"], equipment=["mist spray bottle"], time_estimate_hours=0.25, safety_warnings="Test on inconspicuous area of fabric first."),
                ProductTemplate(id=7, name="Cosmetic Base", description="Eco-enzyme base for natural cosmetic products", processing_instructions="Filter thoroughly. Mix with carrier ingredients per recipe.", ingredients=["eco-enzyme", "carrier oil", "essential oil"], equipment=["filter", "mixing bowl", "containers"], time_estimate_hours=2.0, safety_warnings="Perform patch test before use. Not for ingestion."),
                ProductTemplate(id=8, name="Animal Feed Additive", description="Eco-enzyme additive for animal feed supplementation", processing_instructions="Dilute 1:200 with water. Mix into animal feed.", ingredients=["eco-enzyme", "water"], equipment=["measuring cup", "mixing bucket"], time_estimate_hours=0.25, safety_warnings="Consult veterinarian for dosage. Start with small amounts."),
            ]
            db.add_all(templates)
            db.commit()
    finally:
        db.close()

@app.post("/api/v1/batches", response_model=APIResponse)
async def create_batch(
    batch_data: FermentationBatchCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        calc = EcoEnzymeService.calculate_ingredients(batch_data.waste_weight_kg, batch_data.start_date)
        
        new_batch = FermentationBatch(
            user_id=current_user.id,
            name=batch_data.name,
            waste_weight_kg=batch_data.waste_weight_kg,
            water_liters=calc["ideal_water_liters"],
            sugar_kg=calc["ideal_sugar_kg"],
            start_date=batch_data.start_date,
            harvest_date=calc["expected_harvest_date"],
            status="pending_start"
        )
        db.add(new_batch)
        
        current_user.waste_diverted_kg = (current_user.waste_diverted_kg or 0.0) + batch_data.waste_weight_kg
        
        db.commit()
        db.refresh(new_batch)
        
        logger.info(f"Batch created", extra={"user_id": current_user.id, "batch_id": new_batch.id})
        
        return APIResponse(
            status="success",
            message="Batch created successfully",
            data={
                "batch_id": new_batch.id,
                "waste_weight_kg": new_batch.waste_weight_kg,
                "calculated_water_liters": new_batch.water_liters,
                "calculated_sugar_kg": new_batch.sugar_kg,
                "expected_harvest_date": new_batch.harvest_date.isoformat()
            }
        )
    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}", extra={"user_id": current_user.id})
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid input parameters")
    except Exception as e:
        logger.error(f"Batch creation error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create batch")

@app.get("/api/v1/batches", response_model=APIResponse)
async def list_batches(
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(FermentationBatch).filter(FermentationBatch.user_id == current_user.id)
        total = query.count()
        batches = query.order_by(FermentationBatch.created_at.desc()).limit(limit).offset(offset).all()
        
        batch_data = []
        for batch in batches:
            batch_data.append({
                "id": batch.id,
                "name": batch.name,
                "status": batch.status,
                "waste_weight_kg": batch.waste_weight_kg,
                "water_liters": batch.water_liters,
                "sugar_kg": batch.sugar_kg,
                "selected_product_id": batch.selected_product_id,
                "start_date": batch.start_date.isoformat(),
                "harvest_date": batch.harvest_date.isoformat() if batch.harvest_date else None,
                "created_at": batch.created_at.isoformat()
            })
        
        return APIResponse(
            status="success",
            data={
                "batches": batch_data,
                "total": total,
                "limit": limit,
                "offset": offset,
            }
        )
    except Exception as e:
        logger.error(f"Error fetching batches: {str(e)}", exc_info=True)
        return APIResponse(
            status="success",
            data={
                "batches": [],
                "total": 0,
                "limit": limit,
                "offset": offset,
            }
        )

@app.get("/api/v1/batches/{batch_id}", response_model=APIResponse)
async def get_batch(
    batch_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    batch = db.query(FermentationBatch).filter(
        FermentationBatch.id == batch_id,
        FermentationBatch.user_id == current_user.id
    ).first()
    
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")
    
    return APIResponse(
        status="success",
        data={
            "id": batch.id,
            "name": batch.name,
            "status": batch.status,
            "waste_weight_kg": batch.waste_weight_kg,
            "water_liters": batch.water_liters,
            "sugar_kg": batch.sugar_kg,
            "selected_product_id": batch.selected_product_id,
            "start_date": batch.start_date.isoformat(),
            "harvest_date": batch.harvest_date.isoformat() if batch.harvest_date else None,
            "created_at": batch.created_at.isoformat()
        }
    )

@app.post("/api/v1/batches/{batch_id}/logs", response_model=APIResponse)
async def create_fermentation_log(
    batch_id: int,
    log_data: FermentationLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    batch = db.query(FermentationBatch).filter(
        FermentationBatch.id == batch_id,
        FermentationBatch.user_id == current_user.id
    ).first()
    
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")
    
    try:
        incubation_day = (log_data.log_date.date() - batch.start_date.date()).days
        
        status_pred, confidence, suggestion = FermentationAssistantService.classify_fermentation(
            aroma=log_data.aroma,
            color=log_data.color,
            gas_presence=log_data.gas_presence,
            temperature_c=log_data.temperature_c,
            incubation_day=incubation_day
        )
        
        health_score = FermentationAssistantService.calculate_health_score(status_pred, confidence, incubation_day)
        
        harvest_alert = FermentationAssistantService.should_trigger_harvest_alert(
            status_pred, incubation_day, log_data.gas_presence, log_data.aroma
        )
        
        new_log = FermentationLog(
            batch_id=batch_id,
            log_date=log_data.log_date,
            aroma=log_data.aroma,
            color=log_data.color,
            gas_presence=log_data.gas_presence,
            temperature_c=log_data.temperature_c,
            notes=log_data.notes,
            image_url=log_data.image_url,
            ai_status=status_pred,
            ai_confidence=confidence,
            ai_suggestion=suggestion
        )
        db.add(new_log)
        
        if batch.status == "pending_start":
            batch.status = "in_progress"
        
        db.commit()
        db.refresh(new_log)
        
        logger.info(f"Fermentation log created", extra={"user_id": current_user.id, "batch_id": batch_id, "log_id": new_log.id})
        
        return APIResponse(
            status="success",
            message="Log recorded successfully",
            data={
                "log_id": new_log.id,
                "image_url": new_log.image_url,
                "ai_status_prediction": status_pred,
                "ai_confidence_score": confidence,
                "health_score": round(health_score, 2),
                "corrective_action_suggestion": suggestion,
                "harvest_alert_triggered": harvest_alert,
                "incubation_day": incubation_day
            }
        )
    except ValueError as e:
        logger.warning(f"Validation error in log: {str(e)}", extra={"user_id": current_user.id})
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid log parameters")
    except Exception as e:
        logger.error(f"Log creation error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create log")

@app.get("/api/v1/batches/{batch_id}/logs", response_model=APIResponse)
async def get_batch_logs(
    batch_id: int,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    batch = db.query(FermentationBatch).filter(
        FermentationBatch.id == batch_id,
        FermentationBatch.user_id == current_user.id
    ).first()
    
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")
    
    query = db.query(FermentationLog).filter(FermentationLog.batch_id == batch_id)
    total = query.count()
    logs = query.order_by(FermentationLog.log_date.desc()).limit(limit).offset(offset).all()
    
    logs_data = []
    for log in logs:
        logs_data.append({
            "id": log.id,
            "log_date": log.log_date.isoformat(),
            "aroma": log.aroma,
            "color": log.color,
            "gas_presence": log.gas_presence,
            "temperature_c": log.temperature_c,
            "ai_status": log.ai_status,
            "ai_confidence": log.ai_confidence,
            "ai_suggestion": log.ai_suggestion,
            "created_at": log.created_at.isoformat()
        })
    
    return APIResponse(
        status="success",
        data={
            "logs": logs_data,
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": offset + len(logs_data) < total
        }
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
