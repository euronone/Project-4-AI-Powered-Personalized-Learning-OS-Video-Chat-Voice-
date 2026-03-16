"""Unit tests for /api/onboarding and /api/onboarding/marksheet routes."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient

from tests.conftest import TEST_USER_ID


async def test_onboarding_creates_student(
    http_client: AsyncClient, mock_db, sample_student
):
    resp = await http_client.post("/api/onboarding", json=sample_student)
    assert resp.status_code == 200
    data = resp.json()
    assert data["student_id"] == TEST_USER_ID
    assert data["onboarding_completed"] is True
    assert isinstance(data["subjects_created"], list)
    mock_db.add.assert_called()
    mock_db.commit.assert_awaited()


async def test_onboarding_preserves_existing_subjects(
    http_client: AsyncClient, mock_db, sample_student
):
    """Subjects already in DB must not be duplicated."""
    # First execute (select Student): no existing student
    # Second execute (select Subject.name): Physics already exists
    student_result = MagicMock()
    student_result.scalar_one_or_none.return_value = None

    existing_result = MagicMock()
    existing_result.fetchall.return_value = [("Physics",)]

    mock_db.execute.side_effect = [student_result, existing_result]

    resp = await http_client.post("/api/onboarding", json=sample_student)
    assert resp.status_code == 200
    subjects = resp.json()["subjects_created"]
    assert "Mathematics" in subjects
    assert "Physics" not in subjects  # already existed


async def test_marksheet_rejects_invalid_mime(http_client: AsyncClient):
    resp = await http_client.post(
        "/api/onboarding/marksheet",
        files={"file": ("test.exe", b"binary data", "application/x-msdownload")},
    )
    assert resp.status_code == 415


async def test_marksheet_rejects_oversized_file(http_client: AsyncClient):
    big = b"x" * (11 * 1024 * 1024)  # 11 MB > 10 MB limit
    resp = await http_client.post(
        "/api/onboarding/marksheet",
        files={"file": ("report.jpg", big, "image/jpeg")},
    )
    assert resp.status_code == 413


async def test_marksheet_upload_succeeds(http_client: AsyncClient, mock_db):
    with patch("app.routers.onboarding.get_supabase_client"), patch(
        "asyncio.to_thread", new_callable=AsyncMock, return_value=None
    ):
        resp = await http_client.post(
            "/api/onboarding/marksheet",
            files={"file": ("report.pdf", b"pdf content", "application/pdf")},
        )
    assert resp.status_code == 200
    assert "path" in resp.json()
    assert TEST_USER_ID in resp.json()["path"]


async def test_marksheet_sanitises_path_traversal(http_client: AsyncClient, mock_db):
    with patch("app.routers.onboarding.get_supabase_client"), patch(
        "asyncio.to_thread", new_callable=AsyncMock, return_value=None
    ):
        resp = await http_client.post(
            "/api/onboarding/marksheet",
            files={"file": ("../../etc/passwd", b"data", "image/png")},
        )
    assert resp.status_code == 200
    path = resp.json()["path"]
    assert ".." not in path
    assert "etc/passwd" not in path
