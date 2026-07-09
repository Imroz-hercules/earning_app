from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from werkzeug.security import check_password_hash, generate_password_hash

from .extensions import db


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def new_id() -> str:
    return str(uuid4())


class TimestampMixin:
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )


class User(TimestampMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=new_id)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(32), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(24), default="pending", nullable=False, index=True)
    bank_account_number = db.Column(db.String(64), nullable=True)
    bank_name = db.Column(db.String(160), nullable=True)
    account_holder_name = db.Column(db.String(160), nullable=True)
    ifsc_code = db.Column(db.String(24), nullable=True)

    documents = db.relationship("Document", back_populates="user", cascade="all, delete-orphan")
    attendance = db.relationship("Attendance", back_populates="user", cascade="all, delete-orphan")
    submissions = db.relationship("TaskSubmission", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_documents: bool = False) -> dict:
        data = {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "status": self.status,
            "bank_account_number": self.bank_account_number or "",
            "bank_name": self.bank_name or "",
            "account_holder_name": self.account_holder_name or "",
            "ifsc_code": self.ifsc_code or "",
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
        if include_documents:
            data["documents"] = [document.to_dict() for document in self.documents]
        return data


class AdminUser(TimestampMixin, db.Model):
    __tablename__ = "admin_users"

    id = db.Column(db.String(36), primary_key=True, default=new_id)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict:
        return {"id": self.id, "name": self.name, "email": self.email, "role": "admin"}


class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.String(36), primary_key=True, default=new_id)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    document_type = db.Column(db.String(40), nullable=False)
    file_url = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(24), default="pending", nullable=False)
    uploaded_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    user = db.relationship("User", back_populates="documents")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "document_type": self.document_type,
            "file_url": self.file_url,
            "status": self.status,
            "uploaded_at": self.uploaded_at.isoformat(),
        }


class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.String(36), primary_key=True, default=new_id)
    title = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text, nullable=False)
    reward = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    instructions = db.Column(db.Text, nullable=True)
    required_minutes = db.Column(db.Integer, nullable=False, default=60)
    is_active = db.Column(db.Boolean, default=False, nullable=False, index=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    attendance = db.relationship("Attendance", back_populates="task", cascade="all, delete-orphan")
    submissions = db.relationship("TaskSubmission", back_populates="task", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "reward": float(self.reward or 0),
            "instructions": self.instructions or "",
            "required_minutes": self.required_minutes,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }


class Attendance(db.Model):
    __tablename__ = "attendance"

    id = db.Column(db.String(36), primary_key=True, default=new_id)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    task_id = db.Column(db.String(36), db.ForeignKey("tasks.id"), nullable=False, index=True)
    check_in = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    check_out = db.Column(db.DateTime(timezone=True), nullable=True)
    duration_minutes = db.Column(db.Integer, default=0, nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)

    user = db.relationship("User", back_populates="attendance")
    task = db.relationship("Task", back_populates="attendance")

    __table_args__ = (db.UniqueConstraint("user_id", "task_id", name="uq_attendance_user_task"),)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "task_id": self.task_id,
            "task": self.task.to_dict() if self.task else None,
            "check_in": self.check_in.isoformat(),
            "check_out": self.check_out.isoformat() if self.check_out else None,
            "duration_minutes": self.duration_minutes,
            "completed": self.completed,
        }


class TaskSubmission(db.Model):
    __tablename__ = "task_submission"

    id = db.Column(db.String(36), primary_key=True, default=new_id)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    task_id = db.Column(db.String(36), db.ForeignKey("tasks.id"), nullable=False, index=True)
    remarks = db.Column(db.Text, nullable=True)
    proof_file = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(24), default="pending", nullable=False)
    submitted_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    user = db.relationship("User", back_populates="submissions")
    task = db.relationship("Task", back_populates="submissions")

    __table_args__ = (db.UniqueConstraint("user_id", "task_id", name="uq_submission_user_task"),)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "task_id": self.task_id,
            "task": self.task.to_dict() if self.task else None,
            "remarks": self.remarks or "",
            "proof_file": self.proof_file,
            "status": self.status,
            "submitted_at": self.submitted_at.isoformat(),
        }


class DeviceLog(db.Model):
    __tablename__ = "device_logs"

    id = db.Column(db.String(36), primary_key=True, default=new_id)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True, index=True)
    device_name = db.Column(db.String(120), nullable=True)
    browser = db.Column(db.String(120), nullable=True)
    operating_system = db.Column(db.String(120), nullable=True)
    ip_address = db.Column(db.String(80), nullable=True)
    login_time = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
