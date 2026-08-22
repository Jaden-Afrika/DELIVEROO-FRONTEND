"""Functional tests for the auth API: signup, login, logout, guards."""

import os
import tempfile
import unittest

# create_app() requires these before it runs; a throwaway SQLite file keeps
# the test suite self-contained and independent of any real database.
os.environ["DATABASE_URL"] = "sqlite:///" + tempfile.mkstemp(suffix=".db")[1]
os.environ["JWT_SECRET_KEY"] = "test-only-secret"

from datetime import UTC, datetime

from werkzeug.security import check_password_hash  # noqa: E402
from sqlalchemy import event  # noqa: E402

from backend.database import create_app, db  # noqa: E402
from backend.models import User  # noqa: E402


class AuthApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app.config["TESTING"] = True
        with cls.app.app_context():
            # Test-only shim: the models use Postgres' now() as the
            # created_at server default; teach SQLite the same function so
            # the shipped models run unmodified.
            @event.listens_for(db.engine, "connect")
            def sqlite_now(dbapi_connection, _record):
                dbapi_connection.create_function(
                    "now", 0, lambda: datetime.now(UTC).isoformat()
                )

            db.create_all()
        cls.client = cls.app.test_client()

    @classmethod
    def tearDownClass(cls):
        with cls.app.app_context():
            db.drop_all()

    def signup(self, **overrides):
        payload = {
            "name": "Test User",
            "email": "test.user@example.com",
            "password": "password123",
            "confirmPassword": "password123",
        }
        payload.update(overrides)
        return self.client.post("/auth/signup", json=payload)

    def login(self, email="test.user@example.com", password="password123"):
        return self.client.post("/auth/login", json={"email": email, "password": password})

    def token_from(self, response):
        return response.get_json()["access_token"]

    def auth_header(self, token):
        return {"Authorization": f"Bearer {token}"}

    # --- signup ---

    def test_signup_success_creates_user_and_returns_session(self):
        response = self.signup(email="fresh@example.com")
        self.assertEqual(response.status_code, 201)
        body = response.get_json()
        self.assertIn(".", self.token_from(response))  # JWT-ish token present
        self.assertEqual(
            body["user"],
            {"id": body["user"]["id"], "name": "Test User", "email": "fresh@example.com", "role": "user"},
        )
        self.assertNotIn("password", body["user"])

    def test_signup_stores_securely_hashed_password(self):
        self.signup(email="hashcheck@example.com", password="super-secret-9")
        with self.app.app_context():
            user = db.session.query(User).filter_by(email="hashcheck@example.com").one()
            self.assertNotEqual(user.password_hash, "super-secret-9")
            self.assertTrue(check_password_hash(user.password_hash, "super-secret-9"))

    def test_signup_duplicate_email_returns_409(self):
        self.signup(email="dup@example.com")
        response = self.signup(email="dup@example.com")
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.get_json()["error"], "An account with this email already exists.")

    def test_signup_missing_fields_returns_400(self):
        self.assertEqual(self.signup(name="").status_code, 400)
        self.assertEqual(self.signup(email="").status_code, 400)
        self.assertEqual(self.client.post("/auth/signup", data="not json", content_type="text/plain").status_code, 400)

    def test_signup_short_password_returns_400(self):
        self.assertEqual(self.signup(password="short").status_code, 400)

    # --- login ---

    def test_login_success_returns_session(self):
        self.signup(email="login.ok@example.com")
        response = self.login(email="login.ok@example.com")
        self.assertEqual(response.status_code, 200)
        body = response.get_json()
        self.assertEqual(body["user"]["email"], "login.ok@example.com")
        self.assertTrue(body["access_token"])

    def test_login_wrong_password_returns_401_with_specific_error(self):
        self.signup()
        response = self.login(password="definitely-wrong")
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()["error"], "Invalid email or password.")

    def test_login_unknown_email_returns_401_without_user_enumeration(self):
        response = self.login(email="ghost@example.com")
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()["error"], "Invalid email or password.")

    # --- logout & protected routes ---

    def test_logout_without_token_returns_401(self):
        response = self.client.post("/auth/logout")
        self.assertEqual(response.status_code, 401)
        self.assertIn("error", response.get_json())

    def test_logout_with_valid_token_returns_204(self):
        token = self.token_from(self.signup(email="logout@example.com"))
        response = self.client.post("/auth/logout", headers=self.auth_header(token))
        self.assertEqual(response.status_code, 204)

    def test_protected_route_rejects_anonymous_user(self):
        response = self.client.get("/parcels/me")
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()["error"], "Authentication is required.")

    def test_admin_route_rejects_non_admin_token(self):
        token = self.token_from(self.signup(email="nonadmin@example.com"))
        response = self.client.get("/admin/parcels", headers=self.auth_header(token))
        self.assertEqual(response.status_code, 403)


if __name__ == "__main__":
    unittest.main()
