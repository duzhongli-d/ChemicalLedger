from app.db.session import SessionLocal
from app.db.models import Category

CATEGORIES = [
    # (level1, level2, warning_days, unopened_months, opened_months)
    ("实验用溶液", "一般限度试验用溶液", 30, 6, 6),
    ("实验用溶液", "pH标准缓冲液（配制后）", 30, 3, 3),
    ("化学试剂", "固体试剂", 30, 60, 36),
    ("化学试剂", "液体试剂（有机）", 30, 36, 12),
    ("化学试剂", "液体试剂（无机）", 30, 36, 36),
]


def seed():
    db = SessionLocal()
    try:
        for c in CATEGORIES:
            exists = db.query(Category).filter_by(level1=c[0], level2=c[1]).first()
            if not exists:
                db.add(
                    Category(
                        level1=c[0],
                        level2=c[1],
                        warning_threshold_days=c[2],
                        unopened_shelf_months=c[3],
                        opened_shelf_months=c[4],
                    )
                )
        db.commit()
        print("Categories seeded.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
