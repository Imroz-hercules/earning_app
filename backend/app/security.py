from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from .models import AdminUser, User


def current_user() -> User | None:
    identity = get_jwt_identity()
    return User.query.get(identity) if identity else None


def current_admin() -> AdminUser | None:
    identity = get_jwt_identity()
    return AdminUser.query.get(identity) if identity else None


def role_required(role: str):
    def decorator(view):
        @wraps(view)
        @jwt_required()
        def wrapped(*args, **kwargs):
            if get_jwt().get("role") != role:
                return jsonify({"message": "Forbidden"}), 403
            return view(*args, **kwargs)

        return wrapped

    return decorator


def approved_user_required(view):
    @wraps(view)
    @role_required("user")
    def wrapped(*args, **kwargs):
        user = current_user()
        if not user:
            return jsonify({"message": "User not found"}), 404
        if user.status != "approved":
            return jsonify({"message": "Your account is still under verification"}), 403
        return view(*args, **kwargs)

    return wrapped

