"""
创建测试数据脚本 - 用于测试仪表板到期提醒功能
运行: cd apps/api && python -m scripts.create_expiry_test_data
"""
import uuid
from datetime import date, timedelta
from app.db.session import SessionLocal
from app.db.models import Ledger, Category, User


def create_expiry_test_ledgers():
    """
    创建带有特定effective_expiry_date的测试台账
    场景:
    - 5天后到期 (alert级别)
    - 15天后到期 (warning级别, 20天过滤器)
    - 25天后到期 (30天过滤器)
    - 35天后到期 (不应显示)
    """
    db = SessionLocal()
    today = date.today()

    try:
        # 获取测试用category (使用第一个)
        category = db.query(Category).first()
        if not category:
            print("错误: 未找到category，请先运行数据库迁移")
            return

        # 获取或创建测试用户
        user = db.query(User).filter(User.role == "admin").first()
        if not user:
            print("错误: 未找到admin用户")
            return

        test_data = [
            # (product_name, batch_no, days_until_expiry)
            ("测试-紧急(5天)", f"TEST-ALERT-{today.isoformat()}", 5),
            ("测试-警告(15天)", f"TEST-WARN-{today.isoformat()}", 15),
            ("测试-预警(25天)", f"TEST-INFO-{today.isoformat()}", 25),
            ("测试-安全(35天)", f"TEST-SAFE-{today.isoformat()}", 35),
        ]

        for product_name, batch_no, days in test_data:
            effective_date = today + timedelta(days=days)
            cert_date = effective_date + timedelta(days=365)  # 确保证书日期不影响计算

            ledger = Ledger(
                id=uuid.uuid4(),
                internal_batch_no=f"TEST{uuid.uuid4().hex[:8].upper()}",
                product_name=product_name,
                batch_no=batch_no,
                cas_no="64-17-5",
                weight_capacity="500mL",
                supplier="测试供应商",
                quantity=1,
                category_id=category.id,
                cert_expiry_date=cert_date,
                effective_expiry_date=effective_date,
                status="active",
                created_by_id=user.id,
            )
            db.add(ledger)
            print(f"创建台账: {product_name}, 到期日: {effective_date}, 剩余: {days}天")

        db.commit()
        print(f"\n[OK] Created {len(test_data)} test ledgers successfully")

    finally:
        db.close()


if __name__ == "__main__":
    create_expiry_test_ledgers()
