from app.db.session import SessionLocal
from app.db.models import User
from app.core.security import hash_password


def seed():
    db = SessionLocal()
    try:
        admin = db.query(User).filter_by(username="admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@abachem.com",
                password_hash=hash_password("changeme123"),
                role="admin",
                department="QC",
            )
            db.add(admin)
            db.commit()
            print("Admin user seeded: admin / changeme123")
        else:
            print("Admin user already exists.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
