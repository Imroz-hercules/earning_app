import click
from flask import Flask

from .extensions import db
from .models import AdminUser


def register_commands(app: Flask) -> None:
    @app.cli.command("init-db")
    def init_db():
        db.create_all()
        click.echo("Database tables are ready.")

    @app.cli.command("seed-admin")
    @click.option("--email", envvar="SEED_ADMIN_EMAIL", required=True)
    @click.option("--password", envvar="SEED_ADMIN_PASSWORD", required=True)
    @click.option("--name", envvar="SEED_ADMIN_NAME", default="TaskHub Admin")
    def seed_admin(email: str, password: str, name: str):
        normalized = email.strip().lower()
        admin = AdminUser.query.filter_by(email=normalized).first()
        if not admin:
            admin = AdminUser(email=normalized, name=name)
            db.session.add(admin)
        admin.name = name
        admin.is_active = True
        admin.set_password(password)
        db.session.commit()
        click.echo(f"Admin user ready: {normalized}")

