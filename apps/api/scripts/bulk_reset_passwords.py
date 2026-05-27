from app.db.session import SessionLocal
from app.db.models import User
from app.core.security import hash_password


def bulk_reset_passwords(new_password: str = "Admin123!") -> dict:
    """Reset password for ALL users.

    Args:
        new_password: The new password to set for all users.

    Returns:
        Dict with 'updated' count and 'errors' list.
    """
    db = SessionLocal()
    updated = 0
    errors = []

    try:
        users = db.query(User).all()
        for user in users:
            try:
                user.password_hash = hash_password(new_password)
                updated += 1
            except Exception as e:
                errors.append(f"User {user.id} ({user.email}): {e}")

        db.commit()
        return {"updated": updated, "errors": errors}
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    result = bulk_reset_passwords()
    print(f"Updated {result['updated']} users.")
    if result["errors"]:
        print(f"Errors: {result['errors']}")
