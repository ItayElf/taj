from taj.endpoints import app
from taj.orm.users import validate_user, insert_user, does_user_exist, validate_token, add_token_if_not_exists
from flask import request, jsonify


@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    if "username" not in request.json or "password" not in request.json:
        return "Missing username or password in json", 400
    username = request.json.get("username")
    password = request.json.get("password")
    try:
        if validate_user(username, password):
            t = add_token_if_not_exists(username)
            return jsonify(t)
        return jsonify(False)
    except FileNotFoundError:
        return jsonify(False)


@app.route("/api/auth/register", methods=["POST"])
def auth_register():
    if "username" not in request.json or "password" not in request.json:
        return "Missing username or password in json", 400
    username = request.json.get("username")
    password = request.json.get("password")
    try:
        insert_user(username, password)
        t = add_token_if_not_exists(username)
        return jsonify(t)
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


@app.route("/api/auth/validate_token", methods=["POST"])
def auth_validate_token():
    if "username" not in request.json or "token" not in request.json:
        return "Missing username or token in json", 400
    username = request.json.get("username")
    token = request.json.get("token")
    if not does_user_exist(username):
        return f"User {username} was not found", 404
    return jsonify(validate_token(username, token))
