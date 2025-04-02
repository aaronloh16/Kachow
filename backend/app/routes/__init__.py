# app/routes/__init__.py
from flask import Blueprint
from .identify import identify_bp

def register_routes(app):
    app.register_blueprint(identify_bp)
