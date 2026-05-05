from fastapi import APIRouter

admin_router = APIRouter(prefix="/admin", tags=["admin"])

# Import sub-routers
from app.api.v1.endpoints import admin_dashboard, admin_users, admin_categories, admin_ledgers, admin_audit_logs, admin_contact, admin_annual_summaries

admin_router.include_router(admin_dashboard.router, prefix="/dashboard", tags=["admin-dashboard"])
admin_router.include_router(admin_users.router, prefix="/users", tags=["admin-users"])
admin_router.include_router(admin_categories.router, prefix="/categories", tags=["admin-categories"])
admin_router.include_router(admin_ledgers.router, prefix="/ledgers", tags=["admin-ledgers"])
admin_router.include_router(admin_audit_logs.router, prefix="/audit-logs", tags=["admin-audit-logs"])
admin_router.include_router(admin_contact.router, prefix="/contact", tags=["admin-contact"])
admin_router.include_router(admin_annual_summaries.router, prefix="/annual-summaries", tags=["admin-annual-summaries"])
