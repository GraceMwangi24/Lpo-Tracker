import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'default_secret_key'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///lpo_tracker.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False


    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'another-super-secret'
    JWT_ACCESS_TOKEN_EXPIRES = 3600