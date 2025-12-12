import os
from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()  # <-- loads backend/.env if present

app = Flask(__name__)
CORS(app)

def get_conn():
    host = os.environ.get("DB_ENDPOINT")
    name = os.environ.get("DB_NAME")
    user = os.environ.get("DB_USER")
    pw   = os.environ.get("DB_PASS")
    port = os.environ.get("DB_PORT", "5432")

    # Hard fail with a helpful message (prevents silent localhost fallback)
    missing = [k for k,v in {
        "DB_ENDPOINT": host, "DB_NAME": name, "DB_USER": user, "DB_PASS": pw
    }.items() if not v]
    if missing:
        raise RuntimeError(f"Missing env vars: {', '.join(missing)}")

    return psycopg2.connect(
        host=host, dbname=name, user=user, password=pw, port=int(port)
    )
