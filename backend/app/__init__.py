from pathlib import Path

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from .config import Config
from .extensions import db, jwt
from .routes.admin import admin_bp
from .routes.auth import auth_bp
from .routes.tasks import tasks_bp
from .routes.user import user_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["FRONTEND_URLS"]}},
        supports_credentials=True,
    )
    db.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(user_bp, url_prefix="/api")
    app.register_blueprint(tasks_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.get("/health")
    def health():
        return {"status": "ok", "service": "taskhub-api"}

    @app.get("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["LOCAL_UPLOAD_DIR"], filename)

    @app.get("/")
    @app.get("/<path:path>")
    def frontend(path=""):
        if path.startswith("api/"):
            return jsonify({"message": "Not found"}), 404

        dist_dir = Path(app.config["FRONTEND_DIST_DIR"])
        requested_file = dist_dir / path
        if path and requested_file.is_file():
            return send_from_directory(dist_dir, path)
        index_file = dist_dir / "index.html"
        if index_file.is_file():
            return send_from_directory(dist_dir, "index.html")
        return jsonify({"message": "Frontend build not found. Run `pnpm build` in frontend/."}), 404

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"message": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(error):
        app.logger.exception(error)
        return jsonify({"message": "Unexpected server error"}), 500

    from .commands import register_commands

    register_commands(app)
    return app
