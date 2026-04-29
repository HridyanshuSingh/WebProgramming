"""
models/database.py
SQLAlchemy ORM Models for MediEquip Pro
Tables: User, Product, Inquiry, ChatLog
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    phone         = db.Column(db.String(20), nullable=True)
    is_admin      = db.Column(db.Boolean, default=False)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    inquiries     = db.relationship('Inquiry', backref='user', lazy=True)
    chats         = db.relationship('ChatLog', backref='user', lazy=True)
    def __repr__(self): return f'<User {self.email}>'


class Product(db.Model):
    __tablename__ = 'products'
    id             = db.Column(db.Integer, primary_key=True)
    name           = db.Column(db.String(150), nullable=False)
    category       = db.Column(db.String(80), nullable=False)
    description    = db.Column(db.Text, nullable=False)
    specifications = db.Column(db.Text, nullable=True)   # JSON string dict
    features       = db.Column(db.Text, nullable=True)   # JSON list of strings
    availability   = db.Column(db.Boolean, default=True)
    image_url      = db.Column(db.String(500), default='')  # real photo URL
    tags           = db.Column(db.String(300), default='')
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    def get_specs(self):
        import json
        try:
            return json.loads(self.specifications) if self.specifications else {}
        except Exception:
            return {}

    def get_features(self):
        import json
        try:
            return json.loads(self.features) if self.features else []
        except Exception:
            return []

    def __repr__(self): return f'<Product {self.name}>'


class Inquiry(db.Model):
    __tablename__ = 'inquiries'
    id               = db.Column(db.Integer, primary_key=True)
    name             = db.Column(db.String(100), nullable=False)
    email            = db.Column(db.String(150), nullable=False)
    phone            = db.Column(db.String(20), nullable=True)
    product_interest = db.Column(db.String(150), nullable=True)
    message          = db.Column(db.Text, nullable=False)
    status           = db.Column(db.String(30), default='New')
    user_id          = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)
    def __repr__(self): return f'<Inquiry from {self.email}>'


class ChatLog(db.Model):
    __tablename__ = 'chat_logs'
    id           = db.Column(db.Integer, primary_key=True)
    session_id   = db.Column(db.String(100), nullable=False)
    user_message = db.Column(db.Text, nullable=False)
    bot_response = db.Column(db.Text, nullable=False)
    user_id      = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    def __repr__(self): return f'<ChatLog [{self.session_id}]>'
