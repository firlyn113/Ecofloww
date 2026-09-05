from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List

class CommunityCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    region: Optional[str] = Field(None, max_length=120)


class UserBase(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    name: str = Field(min_length=1, max_length=100)

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: str
    role: str
    waste_diverted_kg: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class FermentationBatchBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Nama batch")
    waste_weight_kg: float = Field(..., gt=0, le=500, description="Berat limbah dalam kg (0.1-500)")

class FermentationBatchCreate(FermentationBatchBase):
    start_date: datetime

class FermentationBatchUpdate(BaseModel):
    water_liters: Optional[float] = Field(None, ge=0, description="Water liters must be non-negative")
    sugar_kg: Optional[float] = Field(None, ge=0, description="Sugar kg must be non-negative")

class BatchStatusUpdate(BaseModel):
    new_status: str
    notes: Optional[str] = None

class FermentationBatch(FermentationBatchBase):
    id: int
    user_id: str
    status: str
    water_liters: float
    sugar_kg: float
    start_date: datetime
    harvest_date: Optional[datetime] = None
    final_volume_liters: Optional[float] = None
    final_color: Optional[str] = None
    final_aroma_intensity: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class FermentationLogBase(BaseModel):
    log_date: datetime
    aroma: str = Field(..., min_length=1, max_length=50, description="Profil aroma")
    color: str = Field(..., min_length=1, max_length=50, description="Warna larutan")
    gas_presence: bool
    temperature_c: float = Field(..., ge=-10, le=60, description="Suhu dalam Celsius")
    ph: Optional[float] = Field(None, ge=0, le=14, description="pH larutan")
    notes: Optional[str] = Field(None, max_length=2000)
    image_url: Optional[str] = Field(None, max_length=500)

class FermentationLogCreate(FermentationLogBase):
    pass

class FermentationLog(FermentationLogBase):
    id: int
    batch_id: int
    ai_status: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_suggestion: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductTemplateBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str = Field(min_length=1, max_length=2000)
    processing_instructions: str = Field(min_length=1, max_length=5000)
    ingredients: List[str] = Field(default_factory=list, max_length=50)
    equipment: List[str] = Field(default_factory=list, max_length=50)
    time_estimate_hours: float = Field(gt=0, le=10000, description="Time estimate must be positive")
    safety_warnings: str = Field(min_length=1, max_length=2000)
    base_compatibility_score: float = Field(default=0.5, ge=0, le=1)
    tutorial_url: Optional[str] = Field(None, max_length=500)
    regional_average_price: Optional[float] = Field(None, ge=0)

class ProductTemplateCreate(ProductTemplateBase):
    pass

class ProductTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    description: Optional[str] = Field(None, min_length=1, max_length=2000)
    processing_instructions: Optional[str] = Field(None, min_length=1, max_length=5000)
    ingredients: Optional[List[str]] = Field(None, max_length=50)
    equipment: Optional[List[str]] = Field(None, max_length=50)
    time_estimate_hours: Optional[float] = Field(None, gt=0, le=10000)
    safety_warnings: Optional[str] = Field(None, min_length=1, max_length=2000)
    base_compatibility_score: Optional[float] = Field(None, ge=0, le=1)
    tutorial_url: Optional[str] = Field(None, max_length=500)
    regional_average_price: Optional[float] = Field(None, ge=0)

class ProductTemplate(ProductTemplateBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductRecommendationItem(BaseModel):
    product_id: int
    name: str
    compatibility_score: float
    description: str

class ProductRecommendation(BaseModel):
    id: int
    batch_id: int
    recommended_products: List[ProductRecommendationItem]
    selected_product_id: Optional[int] = None
    is_commercial_orientation: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class RoadmapStep(BaseModel):
    title: str
    description: str
    details: str
    completed: bool = False

class RoadmapCreate(BaseModel):
    product_template_id: int

class RoadmapUpdate(BaseModel):
    completed: bool

class RoadmapSummary(BaseModel):
    id: int
    batch_id: int
    product_template_id: int
    status: str
    current_step: int
    total_steps: int
    completed_steps: int
    progress_percentage: float
    steps: List[RoadmapStep]
    started_at: Optional[str] = None
    completed_at: Optional[str] = None

class AIFermentationDiagnoseRequest(BaseModel):
    log_date: datetime
    aroma: str = Field(..., min_length=1, max_length=50)
    color: str = Field(..., min_length=1, max_length=50)
    gas_presence: bool
    temperature_c: float = Field(..., ge=-10, le=60)
    ph: Optional[float] = Field(None, ge=0, le=14)
    incubation_day: int = Field(..., ge=0, le=3650)
    notes: Optional[str] = Field(None, max_length=2000)


class AIFermentationDiagnoseResponse(BaseModel):
    ai_status_prediction: str
    ai_confidence_score: float
    health_score: float
    corrective_action_suggestion: str
    harvest_alert_triggered: bool
    incubation_day: int


class APIResponse(BaseModel):
    status: str
    message: Optional[str] = None
    data: Optional[dict] = None

class ErrorResponse(BaseModel):
    status: str
    code: str
    message: str
    details: Optional[dict] = None

class PaginationResponse(BaseModel):
    total_items: int
    total_pages: int
    current_page: int
    page_size: int
    next_page: Optional[int] = None
    prev_page: Optional[int] = None
    data: list


class LeaderboardItem(BaseModel):
    user_id: str
    name: str
    region: Optional[str] = None
    total_points: int
    rank: int


class LeaderboardResponse(BaseModel):
    total_items: int
    total_pages: int
    current_page: int
    page_size: int
    data: list[LeaderboardItem]

class BatchDailyLogBase(BaseModel):
    log_date: datetime
    action_taken: str = Field(min_length=1, max_length=200)
    condition: str = Field(min_length=1, max_length=100)
    notes: Optional[str] = Field(None, max_length=2000)

class BatchDailyLogCreate(BatchDailyLogBase):
    pass

class BatchDailyLog(BatchDailyLogBase):
    id: int
    batch_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class BatchStatusUpdate(BaseModel):
    new_status: str = Field(..., description="Status baru batch")
    notes: Optional[str] = Field(None, max_length=500, description="Catatan perubahan status")
    
    @field_validator('new_status')
    @classmethod
    def validate_status(cls, v):
        valid_statuses = ['in_progress', 'completed', 'harvested', 'failed', 'paused', 'pending', 'pending_start']
        if v not in valid_statuses:
            raise ValueError(f'Status tidak valid. Pilihan: {valid_statuses}')
        return v

