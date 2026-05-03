# /contact Page Implementation Plan

> **For Claude:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a dedicated `/contact` page with contact form (saved to DB + email) and info cards. Replaces the nav's `/#contact` hash link.

**Architecture:** Full-stack page — Next.js form frontend posting to FastAPI endpoint that saves to PostgreSQL and sends SendGrid email. Auth-optional: logged-in users get pre-filled name/email.

**Tech Stack:** Next.js 16 (App Router), FastAPI + SQLAlchemy, PostgreSQL, SendGrid, TailwindCSS v4

---

## Backend Tasks

### Task 1: Add ContactSubmission Model

**Files:**
- Modify: `apps/api/app/db/models.py`
- Test: `apps/api/app/db/test_models.py` (create if not exists)

**Step 1: Write the failing test**

```python
# apps/api/app/db/test_models.py
import pytest
from uuid import uuid4
from app.db.models import ContactSubmission

def test_contact_submission_model_fields():
    sub = ContactSubmission(
        id=uuid4(),
        name="Test User",
        email="test@example.com",
        subject="Test subject",
        category="support",
        message="This is a test message",
    )
    assert sub.name == "Test User"
    assert sub.email == "test@example.com"
    assert sub.category == "support"
    assert sub.is_read is False
```

**Step 2: Run test to verify it fails**

Run: `cd apps/api && pytest app/db/test_models.py::test_contact_submission_model_fields -v`
Expected: FAIL — model doesn't exist

**Step 3: Write minimal implementation**

Add to `apps/api/app/db/models.py`:

```python
class ContactSubmission(Base):
    __tablename__ = "contact_submissions"

    id = Column(Uuid, primary_key=True, default=uuid_lib.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=True)  # null if anonymous
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)  # support/technical/feature/business/other
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="contact_submissions")
```

Add to `User` model relationship:
```python
contact_submissions = relationship("ContactSubmission", back_populates="user")
```

**Step 4: Run test to verify it passes**

Run: `cd apps/api && pytest app/db/test_models.py::test_contact_submission_model_fields -v`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/app/db/models.py apps/api/app/db/test_models.py
git commit -m "feat(api): add ContactSubmission model"
```

---

### Task 2: Add ContactSubmission Pydantic Schema

**Files:**
- Modify: `apps/api/app/schemas/schemas.py`
- Test: `apps/api/tests/test_schemas.py` (create if not exists)

**Step 1: Write the failing test**

```python
# apps/api/tests/test_schemas.py
import pytest
from app.schemas.schemas import ContactSubmissionCreate, ContactSubmissionResponse

def test_contact_submission_create_schema():
    data = {
        "name": "Test User",
        "email": "test@example.com",
        "subject": "Test",
        "category": "support",
        "message": "Test message content here",
    }
    schema = ContactSubmissionCreate(**data)
    assert schema.name == "Test User"
    assert schema.category == "support"

def test_contact_submission_create_validates_email():
    with pytest.raises(Exception):
        ContactSubmissionCreate(
            name="Test",
            email="not-an-email",
            subject="Test",
            category="support",
            message="Test message",
        )
```

**Step 2: Run test to verify it fails**

Run: `cd apps/api && pytest tests/test_schemas.py -v`
Expected: FAIL — schema doesn't exist

**Step 3: Write minimal implementation**

Add to `apps/api/app/schemas/schemas.py`:

```python
class ContactSubmissionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    subject: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., pattern="^(support|technical|feature|business|other)$")
    message: str = Field(..., min_length=10, max_length=2000)


class ContactSubmissionResponse(BaseModel):
    id: UUID
    name: str
    email: str
    subject: str
    category: str
    message: str
    is_read: bool
    created_at: datetime
    user_id: Optional[UUID]

    model_config = ConfigDict(from_attributes=True)
```

**Step 4: Run test to verify it passes**

Run: `cd apps/api && pytest tests/test_schemas.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/app/schemas/schemas.py apps/api/tests/test_schemas.py
git commit -m "feat(api): add ContactSubmission Pydantic schemas"
```

---

### Task 3: Add Contact Email Function to NotificationService

**Files:**
- Modify: `apps/api/app/services/notification_service.py`

**Step 1: Write the failing test**

```python
# apps/api/tests/test_notification_service.py
import pytest
from unittest.mock import patch, MagicMock

def test_send_contact_email():
    from app.services.notification_service import send_contact_email
    with patch.object(send_contact_email, 'send_email_via_sendgrid') as mock_send:
        mock_send.return_value = True
        result = send_contact_email(
            name="Test",
            email="test@example.com",
            category="support",
            subject="Test",
            message="Test message",
        )
        assert result is True
```

**Step 2: Run test to verify it fails**

Run: `cd apps/api && pytest tests/test_notification_service.py::test_send_contact_email -v`
Expected: FAIL — function doesn't exist

**Step 3: Write minimal implementation**

Add to `apps/api/app/services/notification_service.py`:

```python
def send_contact_email(
    name: str,
    email: str,
    category: str,
    subject: str,
    message: str,
) -> bool:
    """
    Send contact form submission email via SendGrid.
    Returns True if sent, False if skipped (no API key or failure).
    """
    settings = get_settings()
    if not settings.SENDGRID_API_KEY:
        return False

    category_labels = {
        "support": "QC Support",
        "technical": "Technical Issue",
        "feature": "Feature Request",
        "business": "Business Inquiry",
        "other": "Other",
    }

    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail

        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        message_obj = Mail(
            from_email=settings.SENDGRID_FROM_EMAIL,
            to_emails="qc@abachem.com",
            subject=f"【Contact】{category_labels.get(category, category)}: {subject}",
            html_content=f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ea580c;">New Contact Form Submission</h2>
              <table style="border-collapse: collapse; width: 100%;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Name</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">{name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Email</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;"><a href="mailto:{email}">{email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Category</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">{category_labels.get(category, category)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Subject</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">{subject}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Message</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">{message.replace(chr(10), '<br>')}</td>
                </tr>
              </table>
              <p style="margin-top: 16px; color: #6b7280; font-size: 12px;">
                Reply directly to this email to respond to {name} at {email}
              </p>
            </div>
            """,
        )
        sg.send(message_obj)
        return True
    except Exception:
        return False
```

**Step 4: Run test to verify it passes**

Run: `cd apps/api && pytest tests/test_notification_service.py::test_send_contact_email -v`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/app/services/notification_service.py
git commit -m "feat(api): add send_contact_email to notification service"
```

---

### Task 4: Create Contact API Router

**Files:**
- Create: `apps/api/app/api/v1/contact.py`
- Modify: `apps/api/app/main.py`
- Test: `apps/api/tests/test_contact.py` (create)

**Step 1: Write the failing test**

```python
# apps/api/tests/test_contact.py
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_contact_submit_success():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/contact", json={
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test subject",
            "category": "support",
            "message": "This is a test message for the contact form",
        })
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["message"] == "Submission received"

@pytest.mark.asyncio
async def test_contact_submit_validation_error():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/contact", json={
            "name": "",
            "email": "bad-email",
            "subject": "",
            "category": "invalid",
            "message": "short",
        })
        assert response.status_code == 422
```

**Step 2: Run test to verify it fails**

Run: `cd apps/api && pytest tests/test_contact.py -v`
Expected: FAIL — route doesn't exist

**Step 3: Write minimal implementation**

Create `apps/api/app/api/v1/contact.py`:

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import ContactSubmission
from app.schemas.schemas import ContactSubmissionCreate, ContactSubmissionResponse
from app.api.deps import get_current_user
from app.db.models import User
from app.services.notification_service import send_contact_email

router = APIRouter()


@router.post("/", response_model=dict)
def submit_contact(
    data: ContactSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    """
    Submit a contact form. Auth is optional — user_id is captured if logged in.
    Saves to DB and sends email notification.
    """
    submission = ContactSubmission(
        user_id=current_user.id if current_user else None,
        name=data.name,
        email=data.email,
        subject=data.subject,
        category=data.category,
        message=data.message,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # Send email notification (async, non-blocking on response)
    send_contact_email(
        name=data.name,
        email=data.email,
        category=data.category,
        subject=data.subject,
        message=data.message,
    )

    return {"id": str(submission.id), "message": "Submission received"}
```

Modify `apps/api/app/main.py` — add import and router:

```python
from app.api.v1 import auth, ledgers, users, categories, notifications, research, contact

app.include_router(contact.router, prefix="/api/v1/contact", tags=["contact"])
```

**Step 4: Run test to verify it passes**

Run: `cd apps/api && pytest tests/test_contact.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/app/api/v1/contact.py apps/api/app/main.py
git commit -m "feat(api): add contact submission endpoint"
```

---

### Task 5: Create Alembic Migration for ContactSubmission

**Files:**
- Create: `apps/api/alembic/versions/` (auto-generated migration file)
- Run: `alembic revision --autogenerate -m "add contact submissions table"`
- Run: `alembic upgrade head`

**Step 1: Generate migration**

Run: `cd apps/api && alembic revision --autogenerate -m "add contact submissions table"`

**Step 2: Verify migration content**

Check the generated file in `apps/api/alembic/versions/` contains:
- `contact_submissions` table
- All required columns (id, user_id, name, email, subject, category, message, is_read, created_at)

**Step 3: Apply migration**

Run: `cd apps/api && alembic upgrade head`

**Step 4: Commit**

```bash
git add apps/api/alembic/versions/
git commit -m "feat(api): add contact_submissions table migration"
```

---

## Frontend Tasks

### Task 6: Add i18n Keys for Contact Page

**Files:**
- Modify: `apps/web/src/i18n/messages/zh.json`
- Modify: `apps/web/src/i18n/messages/en.json`

**Step 1: Add i18n keys**

In `zh.json`, add under the root (same level as `nav`, `home`, etc.):

```json
"contact": {
  "title": "联系我们",
  "subtitle": "QC技术支持与商务咨询",
  "infoCards": {
    "address": "地址",
    "addressValue": "江苏省苏州市工业园区星湖街328号",
    "email": "邮箱",
    "hours": "工作时间",
    "hoursValue": "周一至周五 9:00-18:00"
  },
  "form": {
    "name": "姓名",
    "email": "邮箱",
    "subject": "主题",
    "subjectPlaceholder": "请输入咨询主题",
    "category": "类别",
    "categorySupport": "QC技术支持",
    "categoryTechnical": "技术问题",
    "categoryFeature": "功能建议",
    "categoryBusiness": "商务咨询",
    "categoryOther": "其他",
    "message": "留言",
    "messagePlaceholder": "请详细描述您的问题或建议...",
    "submit": "提交",
    "submitting": "提交中...",
    "success": "提交成功！我们将在1-2个工作日内回复您。",
    "error": "提交失败，请稍后重试。",
    "validationError": "请填写所有必填项"
  },
  "quickInfo": {
    "title": "联系方式",
    "responseTime": "我们通常在1-2个工作日内回复",
    "departments": "相关部门",
    "departmentQC": "QC部门",
    "departmentTech": "技术支持",
    "departmentSales": "商务合作",
    "emergency": "紧急情况请直接电话联系"
  }
}
```

In `en.json`, same structure with English values.

**Step 2: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('apps/web/src/i18n/messages/zh.json'))" && echo "Valid JSON"`

**Step 3: Commit**

```bash
git add apps/web/src/i18n/messages/zh.json apps/web/src/i18n/messages/en.json
git commit -m "feat(i18n): add contact page translations"
```

---

### Task 7: Add contactApi to Frontend API Client

**Files:**
- Modify: `apps/web/src/lib/api-client.ts`

**Step 1: Add contactApi**

Add at end of file before `export default api`:

```typescript
// ─── Contact ─────────────────────────────────────────────────────────────────

export const contactApi = {
  submit: (data: {
    name: string;
    email: string;
    subject: string;
    category: string;
    message: string;
  }) => api.post("/contact/", data),
};
```

**Step 2: Commit**

```bash
git add apps/web/src/lib/api-client.ts
git commit -m "feat(web): add contactApi.submit to api client"
```

---

### Task 8: Create ContactInfoCards Component

**Files:**
- Create: `apps/web/src/components/contact/ContactInfoCards.tsx`

**Step 1: Write component**

```typescript
"use client";

import { useTranslations } from "next-intl";

export function ContactInfoCards() {
  const t = useTranslations("contact");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Address Card */}
      <div className="bg-card rounded-xl border border-border/50 p-6 flex flex-col items-center text-center hover:border-orange-500/30 transition-colors">
        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>
        <h3 className="font-semibold text-foreground mb-2">{t("infoCards.address")}</h3>
        <p className="text-sm text-muted-foreground">{t("infoCards.addressValue")}</p>
      </div>

      {/* Email Card */}
      <div className="bg-card rounded-xl border border-border/50 p-6 flex flex-col items-center text-center hover:border-orange-500/30 transition-colors">
        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h3 className="font-semibold text-foreground mb-2">{t("infoCards.email")}</h3>
        <a
          href="mailto:qc@abachem.com"
          className="text-sm text-orange-500 hover:text-orange-400 transition-colors"
        >
          qc@abachem.com
        </a>
      </div>

      {/* Hours Card */}
      <div className="bg-card rounded-xl border border-border/50 p-6 flex flex-col items-center text-center hover:border-orange-500/30 transition-colors">
        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-semibold text-foreground mb-2">{t("infoCards.hours")}</h3>
        <p className="text-sm text-muted-foreground">{t("infoCards.hoursValue")}</p>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/web/src/components/contact/ContactInfoCards.tsx
git commit -m "feat(web): add ContactInfoCards component"
```

---

### Task 9: Create QuickInfoPanel Component

**Files:**
- Create: `apps/web/src/components/contact/QuickInfoPanel.tsx`

**Step 1: Write component**

```typescript
"use client";

import { useTranslations } from "next-intl";

export function QuickInfoPanel() {
  const t = useTranslations("contact");

  return (
    <div className="bg-gradient-to-br from-orange-500/5 to-orange-600/5 border border-orange-500/20 rounded-xl p-6 space-y-6">
      <h3 className="font-semibold text-foreground">{t("quickInfo.title")}</h3>

      {/* Response time */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-foreground">{t("quickInfo.responseTime")}</p>
        </div>
      </div>

      {/* Departments */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">{t("quickInfo.departments")}</p>
        <div className="space-y-2">
          {[
            { key: "departmentQC", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
            { key: "departmentTech", icon: "M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" },
            { key: "departmentSales", icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" },
          ].map((dept) => (
            <div key={dept.key} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center">
                <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={dept.icon} />
                </svg>
              </div>
              <span className="text-sm text-muted-foreground">{t(`quickInfo.${dept.key}`)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency note */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
        <p className="text-xs text-amber-600 dark:text-amber-400">{t("quickInfo.emergency")}</p>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/web/src/components/contact/QuickInfoPanel.tsx
git commit -m "feat(web): add QuickInfoPanel component"
```

---

### Task 10: Create ContactForm Component

**Files:**
- Create: `apps/web/src/components/contact/ContactForm.tsx`

**Step 1: Write component**

```typescript
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { contactApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

const CATEGORIES = ["support", "technical", "feature", "business", "other"] as const;
type Category = (typeof CATEGORIES)[number];

export function ContactForm() {
  const t = useTranslations("contact");
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({
    name: user?.username || "",
    email: user?.email || "",
    subject: "",
    category: "" as Category | "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const mutation = useMutation({
    mutationFn: (data: typeof form) => contactApi.submit(data),
    onSuccess: () => {
      setStatus("success");
      setForm({ name: user?.username || "", email: user?.email || "", subject: "", category: "", message: "" });
    },
    onError: () => {
      setStatus("error");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.category || form.message.length < 10) {
      setStatus("error");
      return;
    }
    mutation.mutate(form);
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 p-6">
      <h3 className="font-semibold text-foreground mb-6">{t("form.submit")}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name + Email row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("form.name")} *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("form.email")} *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              required
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("form.subject")} *
          </label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            placeholder={t("form.subjectPlaceholder")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("form.category")} *
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            required
          >
            <option value="">--</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {t(`form.category${cat.charAt(0).toUpperCase() + cat.slice(1)}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("form.message")} *
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder={t("form.messagePlaceholder")}
            rows={5}
            minLength={10}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            {form.message.length}/10 min
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? t("form.submitting") : t("form.submit")}
        </button>

        {/* Status messages */}
        {status === "success" && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm rounded-lg p-3">
            {t("form.success")}
          </div>
        )}
        {status === "error" && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-lg p-3">
            {t("form.error")}
          </div>
        )}
      </form>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/web/src/components/contact/ContactForm.tsx
git commit -m "feat(web): add ContactForm component"
```

---

### Task 11: Create /contact Page

**Files:**
- Create: `apps/web/src/app/[locale]/contact/page.tsx`

**Step 1: Write page**

```typescript
import { ContactInfoCards } from "@/components/contact/ContactInfoCards";
import { ContactForm } from "@/components/contact/ContactForm";
import { QuickInfoPanel } from "@/components/contact/QuickInfoPanel";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/10 border-b border-orange-500/10">
        <div className="max-w-[1320px] mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            联系我们
          </h1>
          <p className="text-muted-foreground">
            QC技术支持与商务咨询
          </p>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-4 py-8 space-y-8">
        {/* Info Cards */}
        <ContactInfoCards />

        {/* Form + Quick Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
          <div>
            <QuickInfoPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/web/src/app/[locale]/contact/page.tsx
git commit -m "feat(web): add /contact page"
```

---

### Task 12: Update Nav — Replace /#contact with /contact

**Files:**
- Modify: `apps/web/src/components/nav/header.tsx:43`

**Step 1: Change nav link**

In `header.tsx`, line 43:
```typescript
// Change from:
{ href: "/#contact", label: t("contact"), key: "contact", icon: "..." }
// To:
{ href: "/contact", label: t("contact"), key: "contact", icon: "..." }
```

Also update the `isActive` function to handle the `/contact` path properly (it already does via `pathname.startsWith(href)`).

**Step 2: Commit**

```bash
git add apps/web/src/components/nav/header.tsx
git commit -m "feat(web): update nav to point /contact instead of /#contact"
```

---

### Task 13: End-to-End Verification

**Step 1: Start services**

Run: `cd apps/api && uvicorn app.main:app --reload --port 8000` (background)
Run: `cd apps/web && pnpm dev` (background)

**Step 2: Test contact page loads**

Navigate: `http://localhost:3000/contact`
Verify: Hero, 3 info cards, form, and quick info panel all render correctly.

**Step 3: Test form submission (anonymous)**

1. Fill form with all fields
2. Submit
3. Verify: Success message shown, form resets
4. Verify: DB record created in `contact_submissions` table

**Step 4: Test pre-filled fields (logged in)**

1. Login at `/login`
2. Navigate to `/contact`
3. Verify: Name and email fields are pre-filled from session

**Step 5: Test language switching**

1. On `/contact`, switch language to English
2. Verify: All text changes to English

**Step 6: Test form validation**

1. Submit empty form
2. Verify: Browser native validation or error message shown

---

## Summary

| # | Task | Type |
|---|------|------|
| 1 | Add ContactSubmission model | Backend |
| 2 | Add Pydantic schemas | Backend |
| 3 | Add send_contact_email to notification service | Backend |
| 4 | Create contact API router | Backend |
| 5 | Create Alembic migration | Backend |
| 6 | Add i18n keys | Frontend |
| 7 | Add contactApi to frontend | Frontend |
| 8 | Create ContactInfoCards component | Frontend |
| 9 | Create QuickInfoPanel component | Frontend |
| 10 | Create ContactForm component | Frontend |
| 11 | Create /contact page | Frontend |
| 12 | Update nav link | Frontend |
| 13 | End-to-end verification | Verification |
