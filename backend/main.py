import os
from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="static", static_url_path="")
CORS(app)

def get_conn():
    return psycopg2.connect(
        host=os.environ["DB_ENDPOINT"],
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASS"],
        port=int(os.environ.get("DB_PORT", "5432"))
    )

@app.route("/")
def serve_login():
    # looks in backend/static/login.html
    return app.send_static_file("login.html")

@app.route("/api/user/dashboard")
def dashboard():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("SELECT id, type, number, balance, color FROM accounts")
    accounts = cur.fetchall()

    cur.execute("""
        SELECT
            description AS "desc",
            date::text AS "date",
            amount,
            account_id AS "accountId",
            category
        FROM transactions
        ORDER BY date DESC
    """)
    transactions = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify({
        "name": "jeff",
        "accounts": accounts,
        "transactions": transactions
    })

if __name__ == "__main__":
    app.run(debug=True)
