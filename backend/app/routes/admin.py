from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models import Attendance, Document, Task, TaskSubmission, User, WithdrawalRequest, utcnow
from ..security import role_required

admin_bp = Blueprint("admin", __name__)


def get_user_or_404(user_id: str) -> User | tuple[dict, int]:
    user = User.query.get(user_id)
    if not user:
        return None
    return user


@admin_bp.get("/dashboard")
@role_required("admin")
def dashboard():
    total_users = User.query.count()
    pending_users = User.query.filter_by(status="pending").count()
    approved_users = User.query.filter_by(status="approved").count()
    active_tasks = Task.query.filter_by(is_active=True).count()
    attendance_today = Attendance.query.count()
    completed_tasks = TaskSubmission.query.filter_by(status="approved").count()
    return jsonify(
        {
            "total_users": total_users,
            "pending_users": pending_users,
            "approved_users": approved_users,
            "active_tasks": active_tasks,
            "attendance": attendance_today,
            "completed_tasks": completed_tasks,
        }
    )


@admin_bp.get("/users")
@role_required("admin")
def users():
    status = request.args.get("status")
    query = User.query.order_by(User.created_at.desc())
    if status:
        query = query.filter_by(status=status)
    return jsonify([user.to_dict(include_documents=True) for user in query.limit(200).all()])


@admin_bp.post("/approve-user")
@role_required("admin")
def approve_user():
    user = get_user_or_404((request.get_json(silent=True) or {}).get("user_id"))
    if not user:
        return jsonify({"message": "User not found"}), 404
    user.status = "approved"
    Document.query.filter_by(user_id=user.id).update({"status": "approved"})
    db.session.commit()
    return jsonify(user.to_dict(include_documents=True))


@admin_bp.post("/reject-user")
@role_required("admin")
def reject_user():
    data = request.get_json(silent=True) or {}
    user = get_user_or_404(data.get("user_id"))
    if not user:
        return jsonify({"message": "User not found"}), 404
    user.status = "rejected"
    Document.query.filter_by(user_id=user.id).update({"status": "rejected"})
    db.session.commit()
    return jsonify(user.to_dict(include_documents=True))


@admin_bp.get("/tasks")
@role_required("admin")
def tasks():
    rows = Task.query.order_by(Task.created_at.desc()).limit(100).all()
    return jsonify([task.to_dict() for task in rows])


@admin_bp.post("/create-task")
@role_required("admin")
def create_task():
    data = request.get_json(silent=True) or {}
    required = ["title", "description", "reward", "required_minutes"]
    missing = [field for field in required if data.get(field) in (None, "")]
    if missing:
        return jsonify({"message": f"Missing fields: {', '.join(missing)}"}), 400
    task = Task(
        title=data["title"].strip(),
        description=data["description"].strip(),
        reward=data["reward"],
        required_minutes=int(data["required_minutes"]),
        instructions=data.get("instructions", "").strip(),
        is_active=bool(data.get("is_active", False)),
    )
    if task.is_active:
        Task.query.update({"is_active": False})
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


@admin_bp.put("/task/<task_id>")
@role_required("admin")
def update_task(task_id: str):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404
    data = request.get_json(silent=True) or {}
    for field in ["title", "description", "instructions"]:
        if field in data:
            setattr(task, field, str(data[field]).strip())
    if "reward" in data:
        task.reward = data["reward"]
    if "required_minutes" in data:
        task.required_minutes = int(data["required_minutes"])
    if "is_active" in data:
        task.is_active = bool(data["is_active"])
        if task.is_active:
            Task.query.filter(Task.id != task.id).update({"is_active": False})
    db.session.commit()
    return jsonify(task.to_dict())


@admin_bp.delete("/task/<task_id>")
@role_required("admin")
def delete_task(task_id: str):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"})


@admin_bp.post("/task/<task_id>/publish")
@role_required("admin")
def publish_task(task_id: str):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404
    Task.query.update({"is_active": False})
    task.is_active = True
    db.session.commit()
    return jsonify(task.to_dict())


@admin_bp.get("/attendance")
@role_required("admin")
def attendance():
    rows = Attendance.query.order_by(Attendance.check_in.desc()).limit(200).all()
    return jsonify([row.to_dict() | {"user": row.user.to_dict()} for row in rows])


@admin_bp.get("/submissions")
@role_required("admin")
def submissions():
    rows = TaskSubmission.query.order_by(TaskSubmission.submitted_at.desc()).limit(200).all()
    return jsonify([row.to_dict() | {"user": row.user.to_dict()} for row in rows])


@admin_bp.post("/submission/<submission_id>/<status>")
@role_required("admin")
def review_submission(submission_id: str, status: str):
    if status not in {"approved", "rejected"}:
        return jsonify({"message": "Invalid status"}), 400
    submission = TaskSubmission.query.get(submission_id)
    if not submission:
        return jsonify({"message": "Submission not found"}), 404
    submission.status = status
    db.session.commit()
    return jsonify(submission.to_dict())


@admin_bp.get("/reports")
@role_required("admin")
def reports():
    return jsonify(
        {
            "completed_tasks": TaskSubmission.query.filter_by(status="approved").count(),
            "pending_tasks": TaskSubmission.query.filter_by(status="pending").count(),
            "rejected_tasks": TaskSubmission.query.filter_by(status="rejected").count(),
            "checked_in": Attendance.query.filter_by(check_out=None).count(),
        }
    )


@admin_bp.get("/withdrawals")
@role_required("admin")
def withdrawals():
    rows = WithdrawalRequest.query.order_by(WithdrawalRequest.requested_at.desc()).limit(200).all()
    return jsonify([row.to_dict() | {"user": row.user.to_dict()} for row in rows])


@admin_bp.post("/withdrawal/<withdrawal_id>/<status>")
@role_required("admin")
def review_withdrawal(withdrawal_id: str, status: str):
    if status not in {"approved", "rejected"}:
        return jsonify({"message": "Invalid status"}), 400
    withdrawal = WithdrawalRequest.query.get(withdrawal_id)
    if not withdrawal:
        return jsonify({"message": "Withdrawal request not found"}), 404
    if withdrawal.status != "pending":
        return jsonify({"message": "This withdrawal request was already reviewed"}), 409
    withdrawal.status = status
    withdrawal.reviewed_at = utcnow()
    db.session.commit()
    return jsonify(withdrawal.to_dict())

