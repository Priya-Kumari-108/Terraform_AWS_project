from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# MongoDB connection
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["mydatabase"]
collection = db["mycollection"]

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "backend": "Flask Backend",
        "status": "Running",
        "message": "DevOps backend is healthy"
    })

@app.route("/submit", methods=["POST"])
def submit():
    data = request.get_json()
    username = data.get("username", "").strip()
    tool = data.get("tool", "").strip()

    if not username or not tool:
        return jsonify({"error": "Username and tool are required"}), 400

    doc = {
        "username": username,
        "tool": tool,
        "timestamp": datetime.utcnow().isoformat()
    }
    result = collection.insert_one(doc)

    return jsonify({
        "success": True,
        "message": f"Submitted! {username} selected {tool}",
        "id": str(result.inserted_id)
    })

@app.route("/submissions", methods=["GET"])
def get_submissions():
    docs = list(collection.find({}, {"_id": 0}))
    return jsonify(docs)

@app.route("/")
def home():
    return "Flask Backend Running Successfully"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
