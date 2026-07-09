from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models import Attendance, Task, TaskSubmission
from ..security import approved_user_required, current_user, role_required
from ..storage import save_upload

tasks_bp = Blueprint("tasks", __name__)


def active_task() -> Task | None:
    return Task.query.filter_by(is_active=True).order_by(Task.created_at.desc()).first()


@tasks_bp.get("/today-task")
@approved_user_required
def today_task():
    user = current_user()
    task = active_task()
    if not task:
        return jsonify({"task": None, "attendance": None, "submission": None})
    attendance = Attendance.query.filter_by(user_id=user.id, task_id=task.id).first()
    submission = TaskSubmission.query.filter_by(user_id=user.id, task_id=task.id).first()
    return jsonify(
        {
            "task": task.to_dict(),
            "attendance": attendance.to_dict() if attendance else None,
            "submission": submission.to_dict() if submission else None,
        }
    )


@tasks_bp.post("/checkin")
@approved_user_required
def checkin():
    user = current_user()
    task = active_task()
    if not task:
        return jsonify({"message": "No active task is available"}), 404
    existing = Attendance.query.filter_by(user_id=user.id, task_id=task.id).first()
    if existing:
        return jsonify({"message": "You have already checked in for this task", "attendance": existing.to_dict()}), 409
    attendance = Attendance(user_id=user.id, task_id=task.id)
    db.session.add(attendance)
    db.session.commit()
    return jsonify(attendance.to_dict()), 201


@tasks_bp.post("/checkout")
@approved_user_required
def checkout():
    user = current_user()
    task = active_task()
    if not task:
        return jsonify({"message": "No active task is available"}), 404
    attendance = Attendance.query.filter_by(user_id=user.id, task_id=task.id).first()
    if not attendance:
        return jsonify({"message": "Check in before checking out"}), 400
    if attendance.check_out:
        return jsonify({"message": "You have already checked out", "attendance": attendance.to_dict()}), 409

    now = datetime.now(timezone.utc)
    attendance.check_out = now
    attendance.duration_minutes = max(0, int((now - attendance.check_in).total_seconds() // 60))
    attendance.completed = attendance.duration_minutes >= task.required_minutes
    db.session.commit()
    return jsonify(attendance.to_dict())


@tasks_bp.post("/submit-task")
@approved_user_required
def submit_task():
    user = current_user()
    task = active_task()
    if not task:
        return jsonify({"message": "No active task is available"}), 404
    attendance = Attendance.query.filter_by(user_id=user.id, task_id=task.id).first()
    if not attendance:
        return jsonify({"message": "Check in before submitting the task"}), 400
    existing = TaskSubmission.query.filter_by(user_id=user.id, task_id=task.id).first()
    if existing and existing.status in {"pending", "approved"}:
        return jsonify({"message": "Task is already submitted", "submission": existing.to_dict()}), 409

    proof_url = None
    if request.files.get("proof"):
        try:
            proof_url = save_upload(request.files["proof"], f"proofs/{user.id}")
        except ValueError as exc:
            return jsonify({"message": str(exc)}), 400

    if existing and existing.status == "rejected":
        existing.remarks = request.form.get("remarks", "").strip()
        if proof_url:
            existing.proof_file = proof_url
        existing.status = "pending"
        existing.submitted_at = datetime.now(timezone.utc)
        submission = existing
    else:
        submission = TaskSubmission(
            user_id=user.id,
            task_id=task.id,
            remarks=request.form.get("remarks", "").strip(),
            proof_file=proof_url,
        )
        db.session.add(submission)
    db.session.commit()
    return jsonify(submission.to_dict()), 201


@tasks_bp.get("/attendance")
@role_required("user")
def attendance_history():
    user = current_user()
    rows = (
        Attendance.query.filter_by(user_id=user.id)
        .order_by(Attendance.check_in.desc())
        .limit(100)
        .all()
    )
    return jsonify([row.to_dict() for row in rows])


@tasks_bp.get("/task-history")
@role_required("user")
def task_history():
    user = current_user()
    rows = (
        TaskSubmission.query.filter_by(user_id=user.id)
        .order_by(TaskSubmission.submitted_at.desc())
        .limit(100)
        .all()
    )
    return jsonify([row.to_dict() for row in rows])
