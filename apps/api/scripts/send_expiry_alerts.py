"""Daily expiry alert job — run via cron or scheduler."""
from datetime import date
from app.db.session import SessionLocal
from app.db.models import Ledger, Category, Notification


def send_expiry_alerts():
    db = SessionLocal()
    try:
        today = date.today()
        ledgers = (
            db.query(Ledger)
            .filter(Ledger.status == "active")
            .all()
        )

        for ledger in ledgers:
            category = ledger.category
            days_left = (ledger.effective_expiry_date - today).days

            if days_left <= category.warning_threshold_days and days_left >= 0:
                # Check if we already sent a notification recently
                existing = (
                    db.query(Notification)
                    .filter(
                        Notification.ledger_id == ledger.id,
                        Notification.type.in_(["expiry_warning", "expiry_alert"]),
                    )
                    .first()
                )
                if not existing:
                    notif = Notification(
                        user_id=ledger.created_by_id,
                        type="expiry_warning" if days_left > 7 else "expiry_alert",
                        title=f"台账即将过期：{ledger.product_name}",
                        content=(
                            f"台账「{ledger.product_name}」（批号：{ledger.internal_batch_no}）"
                            f"将于 {ledger.effective_expiry_date} 到期，剩余 {days_left} 天。"
                        ),
                        ledger_id=ledger.id,
                    )
                    db.add(notif)

        db.commit()
        print(f"Expiry alerts processed for {len(ledgers)} active ledgers.")
    finally:
        db.close()


if __name__ == "__main__":
    send_expiry_alerts()
