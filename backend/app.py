from flask import Flask, request, jsonify, session
from models import db, User
from flask_cors import CORS 

# Initialize Flask app
app = Flask(__name__)
app.secret_key = "supersecretkey"

# Configure database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize the database
db.init_app(app)
CORS(app)

# Create database tables
with app.app_context():
    db.create_all()

# User Registration Route
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

# User Login Route
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(username=data["username"]).first()

    if user and user.check_password(data["password"]):
        session["user"] = user.username
        return jsonify({"message": "Login successful", "user": user.username})

    return jsonify({"error": "Invalid credentials"}), 401

# User Logout Route
@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user", None)
    return jsonify({"message": "Logged out successfully"})

# Run the app
if __name__ == "__main__":
    app.run(debug=True)
