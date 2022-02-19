from taj.endpoints import app
from taj.orm.users import validate_user, insert_user, does_user_exist
from flask import request, jsonify


@app.route("/api/auth/login")
def auth_login():
    if "username" not in request.args or "password" not in request.args:
        return "Missing username or password in args", 400
    username = request.args.get("username")
    password = request.args.get("password")
    try:
        return jsonify(validate_user(username, password))
    except FileNotFoundError:
        return jsonify(False)


@app.route("/api/auth/register", methods=["POST"])
def auth_register():
    if "username" not in request.json or "password" not in request.json:
        return "Missing username or password in form", 400
    username = request.json.get("username")
    password = request.json.get("password")
    try:
        insert_user(username, password)
        return "", 200
    except FileExistsError:
        return "Username is already taken", 406
    except ValueError as e:
        return str(e), 400


@app.route("/api/auth/user_exists")
def auth_user_exists():
    if "username" not in request.args:
        return "Missing username in args", 400
    username = request.args.get("username")
    return jsonify(does_user_exist(username))
