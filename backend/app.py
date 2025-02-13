from flask import Flask, request, jsonify, session, send_file
from models import db, User
from flask_cors import CORS 
import io
import csv

app = Flask(__name__)
app.secret_key = "supersecretkey"

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
CORS(app)

with app.app_context():
    db.create_all()

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already taken"}), 400

    new_user = User(username=data["username"], email=data["email"], reg_no=data["reg_no"], institution=data["institution"], name=data["name"])
    new_user.set_password(data["password"])
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully!"})

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(username=data["username"]).first()

    if user and user.check_password(data["password"]):
        session["user"] = user.username
        return jsonify({"message": "Login successful", "user": user.username})

    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user", None)
    return jsonify({"message": "Logged out successfully"})

@app.route("/download_users", methods=["GET"])
def download_users():
    users = User.query.with_entities(User.id, User.reg_no, User.name, User.institution).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Reg No", "Name", "Institution"])  # CSV Headers
    writer.writerows(users)

    output.seek(0)

    return send_file(
        io.BytesIO(output.getvalue().encode()),  # Convert to bytes
        mimetype="text/csv",
        as_attachment=True,
        download_name="users.csv"
    )

if __name__ == "__main__":
    app.run(debug=True)
