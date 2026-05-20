from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, ledgers, users, categories, notifications, research, contact
from app.api.v1.endpoints.admin_router import admin_router
from app.api.v1.endpoints import settings
from app.api.v1.endpoints import public_annual_summaries
from app.core.config import get_settings

app = FastAPI(title="QC Platform API")

app_settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=app_settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Length", "Content-Type"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(ledgers.router, prefix="/api/v1/ledgers", tags=["ledgers"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(categories.router, prefix="/api/v1/categories", tags=["categories"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(research.router, prefix="/api/v1/research", tags=["research"])
app.include_router(contact.router, prefix="/api/v1/contact", tags=["contact"])
app.include_router(public_annual_summaries.router, prefix="/api/v1/public", tags=["public"])
app.include_router(settings.router, prefix="/api/v1/settings", tags=["settings"])
app.include_router(admin_router, prefix="/api/v1", tags=["admin"])


@app.get("/health")
def health():
    return {"status": "ok"}
