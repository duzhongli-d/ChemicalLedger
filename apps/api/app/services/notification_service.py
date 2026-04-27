from datetime import date, datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.core.config import get_settings


def send_expiry_warning_email(
    user_email: str,
    ledger_name: str,
    internal_batch_no: str,
    expiry_date: date,
    days_left: int,
) -> bool:
    """
    Send expiry warning email via SendGrid.
    Returns True if sent, False if skipped (no API key or non-critical failure).
    """
    settings = get_settings()
    if not settings.SENDGRID_API_KEY:
        return False

    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail

        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        is_alert = days_left <= 7

        message = Mail(
            from_email=settings.SENDGRID_FROM_EMAIL,
            to_emails=user_email,
            subject=(
                f"【雅本化学QC平台】台账到期{'紧急' if is_alert else '预警'}提醒"
                if is_alert
                else f"【雅本化学QC平台】台账即将过期提醒"
            ),
            html_content=f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: {'#dc2626' if is_alert else '#d97706'};">
                {'⚠️ 紧急' if is_alert else '📅 预警'} 台账即将到期提醒
              </h2>
              <p>您的台账信息如下：</p>
              <table style="border-collapse: collapse; width: 100%;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">品名</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">{ledger_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">内部批号</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-family: monospace;">{internal_batch_no}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">到期日期</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">{expiry_date}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">剩余天数</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; color: {'#dc2626' if is_alert else '#d97706'}; font-weight: bold; font-size: 18px;">
                    {days_left} 天
                  </td>
                </tr>
              </table>
              <p style="margin-top: 16px; color: #6b7280; font-size: 12px;">
                此邮件由雅本化学QC部门技术服务平台自动发送，请勿回复。
              </p>
            </div>
            """,
        )
        sg.send(message)
        return True
    except Exception:
        return False


def check_and_create_notifications(db: Session) -> dict:
    """
    Scan all active ledgers, create in-app notifications and send emails
    for ledgers approaching expiry.

    Returns summary dict: {"notified": N, "emails_sent": M, "skipped": K}
    """
    from app.db.models import Ledger, Category, Notification, User

    today = date.today()
    ledgers = db.query(Ledger).filter(Ledger.status == "active").all()

    notified = 0
    emails_sent = 0
    skipped = 0

    for ledger in ledgers:
        category = ledger.category
        days_left = (ledger.effective_expiry_date - today).days

        if not (0 <= days_left <= category.warning_threshold_days):
            continue

        # Deduplication: don't spam if a recent notification exists (within 3 days)
        recent_window = today - timedelta(days=3)
        existing = (
            db.query(Notification)
            .filter(
                Notification.ledger_id == ledger.id,
                Notification.type.in_(["expiry_warning", "expiry_alert"]),
                Notification.sent_at >= datetime.combine(recent_window, datetime.min.time()),
            )
            .first()
        )
        if existing:
            skipped += 1
            continue

        # Determine severity
        is_alert = days_left <= 7
        notif_type = "expiry_alert" if is_alert else "expiry_warning"

        notification = Notification(
            user_id=ledger.created_by_id,
            type=notif_type,
            title=f"{'🔴' if is_alert else '🟡'} 台账{'紧急' if is_alert else '预警'}：{ledger.product_name}",
            content=(
                f"台账「{ledger.product_name}」（内部批号：{ledger.internal_batch_no}）"
                f"将于 {ledger.effective_expiry_date} 到期，剩余 <b>{days_left} 天</b>。"
                if is_alert
                else f"台账「{ledger.product_name}」（内部批号：{ledger.internal_batch_no}）"
                f"将于 {ledger.effective_expiry_date} 到期，剩余 {days_left} 天，请及时处理。"
            ),
            ledger_id=ledger.id,
        )
        db.add(notification)
        notified += 1

        # Send email
        user = db.query(User).filter(User.id == ledger.created_by_id).first()
        if user and user.email:
            sent = send_expiry_warning_email(
                user_email=user.email,
                ledger_name=ledger.product_name,
                internal_batch_no=ledger.internal_batch_no,
                expiry_date=ledger.effective_expiry_date,
                days_left=days_left,
            )
            if sent:
                emails_sent += 1

    db.commit()
    return {"notified": notified, "emails_sent": emails_sent, "skipped": skipped}
