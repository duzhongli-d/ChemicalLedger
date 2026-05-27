import pytest
from unittest.mock import patch

# Pre-computed bcrypt hash of "testpass123" (bcrypt not available in test venv)
TEST_PASSWORD_HASH = "$2b$12$vdU1fsWNAXy3kULyqZzA/u9Q0iXn4UFdjx8VMax/78ACjE6xYXElK"


@pytest.fixture(autouse=True)
def mock_password_hash():
    """Replace hash_password/verify_password with static hashes for tests.

    Tests don't exercise auth — they only test ledger_service. Since bcrypt
    has no Python 3.13 wheel available in this environment, we bypass it.
    """
    with patch("app.core.security.hash_password", return_value=TEST_PASSWORD_HASH), \
         patch("app.core.security.verify_password", lambda p, h: p == "testpass123" and h == TEST_PASSWORD_HASH), \
         patch("app.api.v1.auth.verify_password", lambda p, h: p == "testpass123" and h == TEST_PASSWORD_HASH):
        yield