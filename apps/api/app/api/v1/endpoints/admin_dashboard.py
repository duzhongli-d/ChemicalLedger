from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, Date
from datetime import datetime, timedelta
from app.db.session import get_db
from app.api.deps import get_admin_user
from app.db.models import Ledger, Category, User

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    today = datetime.utcnow().date()
    expiring_7d = today + timedelta(days=7)
    expiring_30d = today + timedelta(days=30)

    # 基础统计
    total = db.query(Ledger).count()
    active = db.query(Ledger).filter(Ledger.status == "active").count()
    archived = db.query(Ledger).filter(Ledger.status == "archived").count()
    expiring_7d_count = db.query(Ledger).filter(
        Ledger.status == "active",
        Ledger.effective_expiry_date <= expiring_7d,
        Ledger.effective_expiry_date >= today,
    ).count()
    expiring_30d_count = db.query(Ledger).filter(
        Ledger.status == "active",
        Ledger.effective_expiry_date <= expiring_30d,
        Ledger.effective_expiry_date >= today,
    ).count()

    # 品类分布
    category_stats = db.query(
        Category.level2,
        func.count(Ledger.id)
    ).join(Ledger, Ledger.category_id == Category.id).group_by(Category.level2).all()

    # 用户创建排行 TOP 10
    user_stats = db.query(
        User.username,
        func.count(Ledger.id)
    ).join(Ledger, Ledger.created_by_id == User.id).group_by(User.id, User.username).order_by(func.count(Ledger.id).desc()).limit(10).all()

    return {
        "overview": {
            "total": total,
            "active": active,
            "archived": archived,
            "expiring_7d": expiring_7d_count,
            "expiring_30d": expiring_30d_count,
        },
        "by_category": [{"category": c, "count": n} for c, n in category_stats],
        "by_user": [{"user": u, "count": n} for u, n in user_stats],
    }


@router.get("/trends")
def get_trend_data(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=days)

    # 按日期聚合创建和归档数量
    created = db.query(
        func.cast(Ledger.created_at, Date).label("date"),
        func.count(Ledger.id)
    ).filter(
        func.cast(Ledger.created_at, Date) >= start_date
    ).group_by(func.cast(Ledger.created_at, Date)).all()

    archived = db.query(
        func.cast(Ledger.archived_at, Date).label("date"),
        func.count(Ledger.id)
    ).filter(
        Ledger.status == "archived",
        func.cast(Ledger.archived_at, Date) >= start_date
    ).group_by(func.cast(Ledger.archived_at, Date)).all()

    return {
        "dates": [str(d) for d, _ in created],
        "created": [c for _, c in created],
        "archived": [a for _, a in archived],
    }
