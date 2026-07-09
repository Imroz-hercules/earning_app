from pathlib import Path
from uuid import uuid4

import requests
from flask import current_app
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf", "webp"}


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def save_upload(file: FileStorage, folder: str) -> str:
    if not file or not file.filename:
        raise ValueError("No file provided")
    if not allowed_file(file.filename):
        raise ValueError("Only PNG, JPG, WEBP, and PDF files are allowed")

    safe_name = secure_filename(file.filename)
    storage_name = f"{folder}/{uuid4()}-{safe_name}"

    supabase_url = current_app.config["SUPABASE_URL"]
    service_key = current_app.config["SUPABASE_SERVICE_ROLE_KEY"]
    bucket = current_app.config["SUPABASE_STORAGE_BUCKET"]

    if supabase_url and service_key:
        endpoint = f"{supabase_url}/storage/v1/object/{bucket}/{storage_name}"
        response = requests.post(
            endpoint,
            headers={
                "Authorization": f"Bearer {service_key}",
                "apikey": service_key,
                "x-upsert": "false",
                "Content-Type": file.mimetype or "application/octet-stream",
            },
            data=file.stream.read(),
            timeout=30,
        )
        response.raise_for_status()
        return f"{supabase_url}/storage/v1/object/public/{bucket}/{storage_name}"

    upload_root = Path(current_app.config["LOCAL_UPLOAD_DIR"])
    destination = upload_root / storage_name
    destination.parent.mkdir(parents=True, exist_ok=True)
    file.save(destination)
    return f"/uploads/{storage_name}"

