from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import validates
from enum import Enum

db = SQLAlchemy()


# Enum classes for status values
class RequisitionStatus(Enum):
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'

class LPOStatus(Enum):
    PENDING = 'pending'
    DELIVERED = 'delivered'
    NOT_DELIVERED = 'not_delivered'

# User model (for user authentication and roles)
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)  
    password_hash = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='user')  
    requisitions = db.relationship('Requisition', backref='user', lazy=True)

    @validates('email')
    def validate_email(self, _, value):
        if "@" not in value or "." not in value:
            raise ValueError("Invalid email format.")
        return value

    @validates('password_hash')
    def validate_password(self, _, value):
        if len(value) < 100:  
            value = generate_password_hash(value)
        return value

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f"<User id={self.id} name='{self.name}' email='{self.email}'>"
    
# Product model
class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200), nullable=True)

    requisition_products = db.relationship('RequisitionProduct',back_populates='product',cascade='all, delete-orphan')   

    def __repr__(self):
        return f"<Product id={self.id} name='{self.name}' price={self.price}>"

# Supplier Model
class Supplier(db.Model):
    __tablename__ = 'suppliers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    contact_name = db.Column(db.String(100), nullable=True)
    contact_email = db.Column(db.String(100), nullable=True)
    contact_phone = db.Column(db.String(15), nullable=True)
    address = db.Column(db.String(200), nullable=True)

    # Relationship to LPOs (One supplier can have multiple LPOs)
    lpos = db.relationship('LPO', backref='supplier', lazy=True)

    @validates('name')
    def validate_name(self, _, value):
        if not value or len(value) < 2:
            raise ValueError("Supplier name must be at least 2 characters long.")
        return value

    @validates('contact_email')
    def validate_email(self, _, value):
        if value and ("@" not in value or "." not in value):
            raise ValueError("Invalid contact email format.")
        return value

    @validates('contact_phone')
    def validate_phone(self, _, value):
        if value and len(value) < 10:
            raise ValueError("Contact phone number must be at least 10 digits long.")
        return value
    
    def __repr__(self):
        return f"<Supplier id={self.id} name='{self.name}'>"

# Requisition model
class Requisition(db.Model):
    __tablename__ = 'requisitions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.Enum(RequisitionStatus), default=RequisitionStatus.PENDING)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)


    products = db.relationship('RequisitionProduct', back_populates='requisition', lazy=True)

    def __repr__(self):
        return f"<Requisition id={self.id} status='{self.status.value}' user_id={self.user_id}>"


# LPO model (for purchase orders)
class LPO(db.Model):
    __tablename__ = 'lpos'
    id = db.Column(db.Integer, primary_key=True)
    requisition_id = db.Column(db.Integer, db.ForeignKey('requisitions.id', ondelete='CASCADE'), nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.Enum(LPOStatus), default=LPOStatus.PENDING)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    total_value = db.Column(db.Float, nullable=False, default=0.0)

    products = db.relationship('LPOProduct', backref='lpo', lazy=True)
    
    def __repr__(self):
        return f"<LPO id={self.id} status='{self.status.value}' supplier_id={self.supplier_id}>total_value={self.total_value}>"

# Association table for many-to-many relationship between Requisition and Product
class RequisitionProduct(db.Model):
    __tablename__ = 'requisition_product'
    requisition_id = db.Column(db.Integer, db.ForeignKey('requisitions.id'), primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), primary_key=True)
    quantity = db.Column(db.Integer, nullable=False)

    product     = db.relationship('Product', back_populates ='requisition_products')
    requisition = db.relationship('Requisition', back_populates='products')


    def __repr__(self):
        return f"<RequisitionProduct requisition_id={self.requisition_id} product_id={self.product_id} quantity={self.quantity}>"

# Association table for many-to-many relationship between LPO and Product
class LPOProduct(db.Model):
    __tablename__ = 'lpo_product'
    lpo_id = db.Column(db.Integer, db.ForeignKey('lpos.id'), primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), primary_key=True)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f"<LPOProduct lpo_id={self.lpo_id} product_id={self.product_id} quantity={self.quantity} price={self.price}>"




