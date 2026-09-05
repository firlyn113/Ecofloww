from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.base import User, Community, FermentationBatch
from app.schemas.base import APIResponse, LeaderboardItem, LeaderboardResponse

router = APIRouter(prefix="/api/v1", tags=["community"])

POINT_RULES = {
    "daily_log": 50,
    "batch_completed": 200,
    "commercialized": 500,
}


@router.get("/leaderboard", response_model=APIResponse)
async def get_leaderboard(
    region: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_points = (
        db.query(
            User.id.label("user_id"),
            User.name.label("name"),
            Community.region.label("region"),
            (
                func.coalesce(func.count(FermentationBatch.id), 0) * POINT_RULES["batch_completed"]
            ).label("total_points"),
        )
        .outerjoin(Community, Community.id == User.community_id)
        .outerjoin(FermentationBatch, FermentationBatch.user_id == User.id)
        .group_by(User.id, User.name, Community.region)
    )

    if region:
        user_points = user_points.filter(Community.region == region)

    rows = user_points.all()
    rows = sorted(rows, key=lambda row: int(row.total_points or 0), reverse=True)

    total_items = len(rows)
    total_pages = max(1, (total_items + page_size - 1) // page_size)
    start = (page - 1) * page_size
    end = start + page_size
    sliced = rows[start:end]

    items = [
        LeaderboardItem(
            user_id=str(row.user_id),
            name=str(row.name or "User"),
            region=row.region,
            total_points=int(row.total_points or 0),
            rank=start + idx + 1,
        ).model_dump()
        for idx, row in enumerate(sliced)
    ]

    return APIResponse(
        status="success",
        message="Leaderboard retrieved",
        data=LeaderboardResponse(
            total_items=total_items,
            total_pages=total_pages,
            current_page=page,
            page_size=page_size,
            data=items,
        ).model_dump(),
    )
