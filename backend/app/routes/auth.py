from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from ..extensions import db
from ..models import AdminUser, DeviceLog, User

auth_bp = Blueprint("auth", __name__)


def normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def token_response(identity: str, role: str, profile: dict) -> dict:
    token = create_access_token(identity=identity, additional_claims={"role": role})
    return {"access_token": token, "role": role, "profile": profile}


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    required = ["name", "email", "phone", "password"]
    missing = [field for field in required if not str(data.get(field, "")).strip()]
    if missing:
        return jsonify({"message": f"Missing fields: {', '.join(missing)}"}), 400

    email = normalize_email(data["email"])
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email is already registered"}), 409

    user = User(name=data["name"].strip(), email=email, phone=data["phone"].strip())
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return jsonify(token_response(user.id, "user", user.to_dict())), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = normalize_email(data.get("email", ""))
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(data.get("password", "")):
        admin = AdminUser.query.filter_by(email=email).first()
        if admin and admin.is_active and admin.check_password(data.get("password", "")):
            return jsonify(token_response(admin.id, "admin", admin.to_dict()))
        return jsonify({"message": "Invalid email or password"}), 401

    db.session.add(
        DeviceLog(
            user_id=user.id,
            browser=request.headers.get("User-Agent", "")[:120],
            ip_address=request.headers.get("X-Forwarded-For", request.remote_addr),
        )
    )
    db.session.commit()
    return jsonify(token_response(user.id, "user", user.to_dict()))


@auth_bp.post("/admin/login")
def admin_login():
    data = request.get_json(silent=True) or {}
    admin = AdminUser.query.filter_by(email=normalize_email(data.get("email", ""))).first()
    if not admin or not admin.is_active or not admin.check_password(data.get("password", "")):
        return jsonify({"message": "Invalid admin credentials"}), 401
    return jsonify(token_response(admin.id, "admin", admin.to_dict()))


@auth_bp.get("/me")
@jwt_required()
def me():
    from flask_jwt_extended import get_jwt

    role = get_jwt().get("role")
    identity = get_jwt_identity()
    model = AdminUser if role == "admin" else User
    account = model.query.get(identity)
    if not account:
        return jsonify({"message": "Account not found"}), 404
    profile = account.to_dict(include_documents=True) if role == "user" else account.to_dict()
    return jsonify({"role": role, "profile": profile})


@auth_bp.post("/logout")
def logout():
    return jsonify({"message": "Logged out"})
