from datetime import date, datetime, timedelta, timezone

from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.models.base import FermentationBatch, FermentationLog, ProductRecommendation, RoadmapProgress, User


class AdminService:
    """Statistik & agregasi untuk dashboard admin (komunitas, tren, model)."""

    @staticmethod
    def get_community_stats(db: Session, community_id: int | None = None, start_date: date | None = None, end_date: date | None = None) -> dict:
        """Statistik agregat komunitas: users, batches, waste, success rate, engagement.

        Args:
            db: SQLAlchemy session.
            community_id: Filter per komunitas (None = semua).
            start_date: Batas bawah tanggal (inclusive).
            end_date: Batas atas tanggal (inclusive, dihitung +1 hari).

        Returns:
            dict: Statistik lengkap termasuk dict "engagement".
        """
        users_query = db.query(User)
        batches_query = db.query(FermentationBatch).join(User, User.id == FermentationBatch.user_id)
        logs_query = db.query(FermentationLog).join(FermentationBatch, FermentationBatch.id == FermentationLog.batch_id).join(User, User.id == FermentationBatch.user_id)
        roadmaps_query = db.query(RoadmapProgress).join(User, User.id == RoadmapProgress.user_id)
        recommendations_query = db.query(ProductRecommendation).join(FermentationBatch, ProductRecommendation.batch_id == FermentationBatch.id).join(User, User.id == FermentationBatch.user_id)

        if community_id is not None:
            users_query = users_query.filter(User.community_id == community_id)
            batches_query = batches_query.filter(User.community_id == community_id)
            logs_query = logs_query.filter(User.community_id == community_id)
            roadmaps_query = roadmaps_query.filter(User.community_id == community_id)
            recommendations_query = recommendations_query.filter(User.community_id == community_id)
        if start_date:
            batches_query = batches_query.filter(FermentationBatch.created_at >= start_date)
            logs_query = logs_query.filter(FermentationLog.log_date >= start_date)
            roadmaps_query = roadmaps_query.filter(RoadmapProgress.created_at >= start_date)
            recommendations_query = recommendations_query.filter(ProductRecommendation.created_at >= start_date)
        if end_date:
            end_exclusive = end_date + timedelta(days=1)
            batches_query = batches_query.filter(FermentationBatch.created_at < end_exclusive)
            logs_query = logs_query.filter(FermentationLog.log_date < end_exclusive)
            roadmaps_query = roadmaps_query.filter(RoadmapProgress.created_at < end_exclusive)
            recommendations_query = recommendations_query.filter(ProductRecommendation.created_at < end_exclusive)

        total_users = users_query.count()
        total_batches = batches_query.count()
        total_waste = batches_query.with_entities(func.sum(FermentationBatch.waste_weight_kg)).scalar() or 0.0
        total_enzyme = batches_query.with_entities(func.sum(FermentationBatch.water_liters)).scalar() or 0.0
        normal_logs = logs_query.filter(FermentationLog.ai_status == "Normal").count()
        failed_logs = logs_query.filter(FermentationLog.ai_status == "Failed").count()
        caution_logs = logs_query.filter(FermentationLog.ai_status == "Caution").count()
        total_logs = normal_logs + failed_logs + caution_logs
        success_rate = (normal_logs / total_logs * 100) if total_logs > 0 else 0.0
        users_with_logs = logs_query.with_entities(func.count(func.distinct(FermentationBatch.user_id))).scalar() or 0
        roadmap_users = roadmaps_query.with_entities(func.count(func.distinct(RoadmapProgress.user_id))).scalar() or 0
        recommendation_users = recommendations_query.with_entities(func.count(func.distinct(FermentationBatch.user_id))).scalar() or 0

        return {
            "total_users": total_users,
            "total_batches": total_batches,
            "total_waste_processed_kg": float(total_waste),
            "total_enzyme_produced_liters": float(total_enzyme),
            "success_rate_percentage": round(success_rate, 2),
            "normal_logs": normal_logs,
            "caution_logs": caution_logs,
            "failed_logs": failed_logs,
            "total_logs": total_logs,
            "users_with_logs": users_with_logs,
            "engagement": {
                "log_adoption_percentage": round((users_with_logs / total_users * 100) if total_users else 0, 2),
                "recommendation_adoption_percentage": round((recommendation_users / total_users * 100) if total_users else 0, 2),
                "roadmap_adoption_percentage": round((roadmap_users / total_users * 100) if total_users else 0, 2),
                "average_logs_per_user": round((total_logs / users_with_logs) if users_with_logs else 0, 2),
            },
        }

    @staticmethod
    def get_community_trends(db: Session, days: int = 30, community_id: int | None = None) -> dict:
        """Tren harian jumlah log & success rate untuk N hari terakhir.

        Args:
            db: SQLAlchemy session.
            days: Rentang hari (di-clamp ke 7-90).
            community_id: Filter per komunitas (None = semua).

        Returns:
            dict: {"days", "trends": [{"date", "logs", "normal", "success_rate_percentage"}]}.
                Tanggal tanpa data diisi 0.
        """
        safe_days = min(max(days, 7), 90)
        start_date = datetime.now(timezone.utc) - timedelta(days=safe_days - 1)
        logs_query = db.query(FermentationLog).join(FermentationBatch, FermentationBatch.id == FermentationLog.batch_id).join(User, User.id == FermentationBatch.user_id)
        if community_id is not None:
            logs_query = logs_query.filter(User.community_id == community_id)
        log_rows = logs_query.with_entities(
            func.date(FermentationLog.log_date).label("date"),
            func.count(FermentationLog.id).label("logs"),
            func.sum(case((FermentationLog.ai_status == "Normal", 1), else_=0)).label("normal"),
        ).filter(FermentationLog.log_date >= start_date).group_by(
            func.date(FermentationLog.log_date)
        ).order_by(func.date(FermentationLog.log_date)).all()

        trend_by_date = {
            str(row.date): {
                "logs": int(row.logs or 0),
                "normal": int(row.normal or 0),
                "success_rate_percentage": round((int(row.normal or 0) / int(row.logs or 1)) * 100, 2),
            }
            for row in log_rows
        }
        trends = []
        for offset in range(safe_days):
            current_date = (start_date + timedelta(days=offset)).date().isoformat()
            trends.append({"date": current_date, **trend_by_date.get(current_date, {"logs": 0, "normal": 0, "success_rate_percentage": 0})})

        return {"days": safe_days, "trends": trends}

    @staticmethod
    def get_model_metrics(db: Session = None) -> dict:
        """Metrik performa AI classifier: distribusi status, success rate, avg health score.

        Args:
            db: SQLAlchemy session (default: buat session baru).

        Returns:
            dict: {"total_predictions", "normal_logs", "caution_logs",
                   "failed_logs", "success_rate_percentage",
                   "average_health_score", "uptime_percentage"}.
        """
        if db is None:
            from app.core.database import SessionLocal
            db = SessionLocal()
        
        total_logs = db.query(FermentationLog).count()
        normal_count = db.query(FermentationLog).filter(FermentationLog.ai_status == "Normal").count()
        caution_count = db.query(FermentationLog).filter(FermentationLog.ai_status == "Caution").count()
        failed_count = db.query(FermentationLog).filter(FermentationLog.ai_status == "Failed").count()
        
        success_rate = (normal_count / total_logs * 100) if total_logs > 0 else 0
        
        health_scores = db.query(func.avg(FermentationLog.ai_confidence)).scalar() or 0
        
        return {
            "total_predictions": total_logs,
            "normal_logs": normal_count,
            "caution_logs": caution_count,
            "failed_logs": failed_count,
            "success_rate_percentage": round(success_rate, 2),
            "average_health_score": round(float(health_scores), 2),
            "uptime_percentage": 99.9,
        }
