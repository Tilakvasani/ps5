"""Bootstrap local development config and database.

Usage:
    cd api
    python scripts/setup_local.py
"""

from __future__ import annotations

import secrets
from pathlib import Path

from sqlalchemy.exc import SQLAlchemyError

from app.core.db import Base, engine

ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / ".env"


def write_env_file() -> None:
    if ENV_FILE.exists():
        print(f"[skip] {ENV_FILE} already exists")
        return

    jwt_secret = secrets.token_urlsafe(48)
    app_api_key = secrets.token_urlsafe(32)

    ENV_FILE.write_text(
        "\n".join(
            [
                "APP_NAME=Glowy API",
                "APP_ENV=development",
                "DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/glowy",
                f"JWT_SECRET={jwt_secret}",
                "JWT_ALGORITHM=HS256",
                "JWT_EXPIRE_MINUTES=120",
                f"APP_API_KEY={app_api_key}",
                "RAZORPAY_KEY_ID=replace_me",
                "RAZORPAY_KEY_SECRET=replace_me",
                ""
            ]
        ),
        encoding="utf-8"
    )
    print(f"[ok] wrote {ENV_FILE}")


def create_database() -> None:
    try:
        Base.metadata.create_all(bind=engine)
        print("[ok] created database tables")
    except SQLAlchemyError as exc:
        print("[warn] could not create database tables.")
        print("[hint] ensure PostgreSQL is running and DATABASE_URL is correct in api/.env")
        print(f"[detail] {exc}")


if __name__ == "__main__":
    write_env_file()
    create_database()
