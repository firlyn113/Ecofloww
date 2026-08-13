from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.base import User, FermentationBatch, FermentationLog
from app.schemas.base import APIResponse
from pydantic import BaseModel, Field
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/sensors", tags=["IoT Sensors"])


class SensorData(BaseModel):
    batch_id: int = Field(..., description="ID batch fermentasi")
    temperature: Optional[float] = Field(None, ge=-10, le=60, description="Suhu dalam Celsius")
    ph: Optional[float] = Field(None, ge=0, le=14, description="Nilai pH")
    humidity: Optional[float] = Field(None, ge=0, le=100, description="Kelembaban dalam %")
    gas_level: Optional[float] = Field(None, ge=0, le=100, description="Level gas dalam %")
    timestamp: Optional[datetime] = Field(None, description="Waktu pengukuran sensor")
    sensor_id: Optional[str] = Field(None, description="ID unik sensor IoT")


@router.post("/webhook", response_model=APIResponse)
async def iot_sensor_webhook(
    sensor_data: SensorData,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Webhook endpoint untuk menerima data dari sensor IoT hardware.
    
    Data sensor (suhu, pH, kelembaban, gas) akan disimpan sebagai fermentation log
    dan dapat digunakan untuk monitoring real-time dan analisis AI.
    
    **Keamanan:**
    - Endpoint ini terbuka untuk webhook dari hardware IoT
    - Pastikan sensor_id valid dan batch_id ada di database
    - Implementasi API key/token disarankan untuk produksi
    
    **Contoh Payload dari Sensor:**
    ```json
    {
      "batch_id": 1,
      "temperature": 28.5,
      "ph": 3.8,
      "humidity": 65.2,
      "gas_level": 15.3,
      "sensor_id": "ESP32-001"
    }
    ```
    """
    try:
        batch = db.query(FermentationBatch).filter(FermentationBatch.id == sensor_data.batch_id).first()
        
        if not batch:
            logger.warning(f"IoT webhook: Batch {sensor_data.batch_id} not found from sensor {sensor_data.sensor_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Batch ID {sensor_data.batch_id} not found"
            )
        
        log_timestamp = sensor_data.timestamp or datetime.utcnow()
        
        aroma = "neutral"
        if sensor_data.ph and sensor_data.ph < 4.0:
            aroma = "sour"
        elif sensor_data.temperature and sensor_data.temperature > 30:
            aroma = "fruity"
        
        color = "amber"
        if sensor_data.ph and sensor_data.ph > 5.0:
            color = "dark_brown"
        
        gas_presence = sensor_data.gas_level is not None and sensor_data.gas_level > 5.0
        
        new_log = FermentationLog(
            batch_id=sensor_data.batch_id,
            log_date=log_timestamp.date(),
            aroma=aroma,
            color=color,
            gas_presence=gas_presence,
            temperature=sensor_data.temperature,
            ph=sensor_data.ph,
            notes=f"Data otomatis dari sensor IoT: {sensor_data.sensor_id or 'unknown'}. "
                  f"Humidity: {sensor_data.humidity}%, Gas Level: {sensor_data.gas_level}%"
        )
        
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        
        logger.info(
            f"IoT sensor data received and logged",
            extra={
                "batch_id": sensor_data.batch_id,
                "sensor_id": sensor_data.sensor_id,
                "temperature": sensor_data.temperature,
                "ph": sensor_data.ph,
                "log_id": new_log.id,
            }
        )
        
        return APIResponse(
            status="success",
            message="Sensor data received and logged successfully",
            data={
                "log_id": new_log.id,
                "batch_id": sensor_data.batch_id,
                "timestamp": log_timestamp.isoformat(),
                "sensor_id": sensor_data.sensor_id,
                "recorded_values": {
                    "temperature": sensor_data.temperature,
                    "ph": sensor_data.ph,
                    "humidity": sensor_data.humidity,
                    "gas_level": sensor_data.gas_level,
                }
            }
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"IoT webhook error: {str(e)}", exc_info=True, extra={"sensor_data": sensor_data.dict()})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process sensor data"
        )


@router.get("/status", response_model=APIResponse)
async def sensor_status():
    """
    Health check endpoint untuk IoT sensors.
    Digunakan oleh hardware untuk memverifikasi koneksi ke backend.
    """
    return APIResponse(
        status="success",
        message="IoT sensor webhook is active",
        data={
            "timestamp": datetime.utcnow().isoformat(),
            "endpoint": "/api/v1/sensors/webhook",
            "version": "1.0.0"
        }
    )
