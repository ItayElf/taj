import json

from taj.endpoints import app
from taj.orm.users import validate_user, insert_user
from flask import request


@app.route("/api/auth/login")
def auth_login():
    if "username" not in request.args or "password" not in request.args:
        return "Missing username or password in args", 400
    username = request.args.get("username")
    password = request.args.get("password")
    try:
        return json.dumps(validate_user(username, password))
    except FileNotFoundError:
        return json.dumps(False)


@app.route("/api/auth/register", methods=["POST"])
def auth_register():
    if "username" not in request.form or "password" not in request.form:
        return "Missing username or password in form", 400
    username = request.form.get("username")
    password = request.form.get("password")
    try:
        insert_user(username, password)
        return "", 200
    except FileExistsError:
        return "Username is already taken", 406
    except ValueError as e:
        return str(e), 400
