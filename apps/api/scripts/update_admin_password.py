from app.db.session import SessionLocal
from app.db.models import User
from app.core.security import hash_password


def update_admin_password() -> bool:
    """Update the admin user password.

    Returns:
        True if the admin password was updated successfully, False if user not found.

    Raises:
        Exception: Re-raises any database or hashing error after rollback.
    """
    db = SessionLocal()
    try:
        admin = db.query(User).filter_by(email="admin@abachem.com").first()
        if not admin:
            print("Admin user with email admin@abachem.com not found!")
            return False

        admin.password_hash = hash_password("Admin123!")
        db.commit()
        print("Admin password updated successfully!")
        return True
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    update_admin_password()
