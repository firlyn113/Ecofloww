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
    name: str = Field(min_length=1, max_length=100)
    waste_weight_kg: float = Field(gt=0, le=100000, description="Waste weight must be positive")

class FermentationBatchCreate(FermentationBatchBase):
    start_date: datetime

class FermentationBatchUpdate(BaseModel):
    water_liters: Optional[float] = Field(None, ge=0, description="Water liters must be non-negative")
    sugar_kg: Optional[float] = Field(None, ge=0, description="Sugar kg must be non-negative")

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
    aroma: str = Field(min_length=1, max_length=50)
    color: str = Field(min_length=1, max_length=50)
    gas_presence: bool
    temperature_c: float = Field(ge=-50, le=100, description="Temperature must be between -50 and 100 Celsius")
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

