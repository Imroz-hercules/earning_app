from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models import Document, User
from ..security import current_user, role_required
from ..storage import save_upload

user_bp = Blueprint("user", __name__)


@user_bp.get("/profile")
@role_required("user")
def get_profile():
    user = current_user()
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user.to_dict(include_documents=True))


@user_bp.put("/profile")
@role_required("user")
def update_profile():
    user = current_user()
    if not user:
        return jsonify({"message": "User not found"}), 404
    data = request.get_json(silent=True) or {}
    if "name" in data:
        user.name = data.get("name", user.name).strip()
    if "phone" in data:
        user.phone = data.get("phone", user.phone).strip()
    bank_fields = ["bank_account_number", "bank_name", "account_holder_name", "ifsc_code"]
    for field in bank_fields:
        if field in data:
            value = str(data.get(field) or "").strip()
            setattr(user, field, value.upper() if field == "ifsc_code" else value)
    if data.get("password"):
        user.set_password(data["password"])
    db.session.commit()
    return jsonify(user.to_dict(include_documents=True))


@user_bp.post("/upload-document")
@role_required("user")
def upload_document():
    user = current_user()
    if not user:
        return jsonify({"message": "User not found"}), 404

    document_type = request.form.get("document_type", "").strip()
    file = request.files.get("file")
    if document_type not in {"government_id", "selfie", "proof"}:
        return jsonify({"message": "Invalid document type"}), 400

    existing = Document.query.filter_by(user_id=user.id, document_type=document_type).first()
    if existing and user.status != "rejected":
        return jsonify({"message": "This document is already uploaded"}), 409

    try:
        file_url = save_upload(file, f"documents/{user.id}")
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400

    document = Document(user_id=user.id, document_type=document_type, file_url=file_url)
    user.status = "pending" if user.status == "rejected" else user.status
    db.session.add(document)
    db.session.commit()
    return jsonify(document.to_dict()), 201


@user_bp.get("/verification")
@role_required("user")
def verification_status():
    user = current_user()
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(
        {
            "status": user.status,
            "documents": [document.to_dict() for document in user.documents],
            "bank_account_number": user.bank_account_number or "",
            "bank_name": user.bank_name or "",
            "account_holder_name": user.account_holder_name or "",
            "ifsc_code": user.ifsc_code or "",
        }
    )
