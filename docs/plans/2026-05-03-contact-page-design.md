# /contact Page Design

## Context

The existing `/contact` link in the navigation header points to `/#contact` — a hash anchor that scrolls to the Footer component's contact section. This provides only static address/email info with no interactivity.

Users need a **dedicated `/contact` page** with:
- A contact form for submitting inquiries (saved to DB + email notification)
- Info cards showing address, email, and working hours
- Support for both internal QC staff and external visitors
- Auth-optional form submission (logged-in users get pre-filled fields)

## Design

### Page Layout

```
┌─────────────────────────────────────────────────┐
│  Header (standard, not LedgersTopBar)           │
├─────────────────────────────────────────────────┤
│  Hero: "Contact Us" + subtitle                  │
├─────────────────────────────────────────────────┤
│  Info Cards (3-column grid)                    │
│  [📍 Address] [📧 Email] [⏰ Working Hours]     │
├─────────────────────────────────────────────────┤
│  Two-column form section                        │
│  [Contact Form — left] [Quick Info — right]    │
└─────────────────────────────────────────────────┘
```

### Info Cards
| Card | Content |
|------|---------|
| Address | `footer.contactInfo` from i18n (328 Xinghu St, Suzhou) |
| Email | `footer.email` from i18n (qc@abachem.com) + clickable mailto |
| Working Hours | Weekdays 9:00-18:00 (hardcoded, extend i18n later) |

### Contact Form Fields
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | text | Yes | Pre-filled if logged in |
| Email | email | Yes | Pre-filled if logged in |
| Subject | text | Yes | Free text |
| Category | select | Yes | QC Support / Technical Issue / Feature Request / Business Inquiry / Other |
| Message | textarea | Yes | Min 10 chars |

- Logged-in users: name + email auto-populated from session
- Anonymous users: all fields editable
- On submit: `POST /api/v1/contact` → DB save + email notification
- Success: inline success message, form resets
- Error: inline error message with retry

### Quick Info Panel (right column)
- Department list (QC Dept, Technical Support, Sales)
- Typical response time: "1-2 business days"
- Emergency contact note (if urgent, call directly)
- Existing footer contact info

## Backend Design

### Database Model: ContactSubmission
```python
class ContactSubmission(Base):
    id: UUID (PK)
    user_id: UUID (FK, nullable)      # null if anonymous
    name: str
    email: str
    subject: str
    category: str                     # enum: support/technical/feature/business/other
    message: str
    is_read: bool                     # admin flag
    created_at: datetime
```

### API Endpoint
```
POST /api/v1/contact
Body: { name, email, subject, category, message }
Response: { id, message: "Submission received" }
```

- **Auth**: Optional (user_id captured from session if present)
- **Validation**: Pydantic schema, email format, min lengths
- **Email**: Async SMTP send to `qc@abachem.com` with submission details

## Files to Create/Modify

### Frontend (Next.js)
| File | Action | Purpose |
|------|--------|---------|
| `apps/web/src/app/[locale]/contact/page.tsx` | Create | Contact page |
| `apps/web/src/components/contact/ContactInfoCards.tsx` | Create | 3 info cards |
| `apps/web/src/components/contact/ContactForm.tsx` | Create | Form with validation |
| `apps/web/src/components/contact/QuickInfoPanel.tsx` | Create | Right-column info |
| `apps/web/src/i18n/messages/zh.json` | Modify | Add contact page i18n |
| `apps/web/src/i18n/messages/en.json` | Modify | Add contact page i18n |
| `apps/web/src/components/nav/header.tsx` | Modify | Change `/#contact` → `/contact` |
| `apps/web/src/lib/api-client.ts` | Modify | Add `contactApi.submit()` |

### Backend (FastAPI)
| File | Action | Purpose |
|------|--------|---------|
| `apps/api/app/db/models.py` | Modify | Add ContactSubmission model |
| `apps/api/app/schemas/schemas.py` | Modify | Add ContactSubmissionSchema |
| `apps/api/app/api/v1/contact.py` | Create | New contact router |
| `apps/api/app/services/notification_service.py` | Modify | Add contact email method |
| `apps/api/app/main.py` | Modify | Register contact router |

## Verification

1. Navigate to `/contact` — page loads with hero, info cards, form
2. Fill form as anonymous → submission saved to DB with null user_id
3. Login → navigate to `/contact` → name + email pre-filled
4. Submit form → email received at qc@abachem.com
5. Switch language → all text translates correctly
6. Form validation: submit empty → error messages shown
7. Mobile: responsive layout, form stacks vertically
