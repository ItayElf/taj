import base64
import os
import sys

from taj.endpoints import app
from taj.orm.repos import get_all_repos, get_repo, get_repos_of

from flask import jsonify, request

from taj.orm.users import does_user_exist, validate_token

ROOT_PATH = os.path.normpath(os.path.dirname(sys.modules['__main__'].__file__))


@app.route("/api/repos")
def repos_all_repos():
    all_repos = get_all_repos()
    return jsonify(all_repos)


@app.route("/api/repos/<repo>", methods=["GET", "POST"])
def repos_get_repo(repo):
    if request.method == "GET":
        try:
            r = get_repo(repo)
            return jsonify(r)
        except FileNotFoundError as e:
            return str(e), 404
    elif request.method == "POST":
        try:
            get_repo(repo)
        except FileNotFoundError as e:
            return str(e), 404
        if "username" not in request.json or "token" not in request.json:
            return "Missing username or token in json", 400
        username = request.json.get("username")
        token = request.json.get("token")
        if not does_user_exist(username):
            return f"User {username} was not found", 404
        if not validate_token(username, token):
            return "Token is incorrect or expired", 403
        if "db" not in request.json or "settings" not in request.json:
            return "Missing db file or settings json", 400
        dir_path = os.path.join(ROOT_PATH, "dbs", "users", username, repo)
        if not os.path.isdir(dir_path):
            os.mkdir(dir_path)
        with open(os.path.join(dir_path, "db.db"), "wb+") as f:
            f.write(base64.b64decode(b"".fromhex(request.json["db"])))
        with open(os.path.join(dir_path, "settings.json"), "wb+") as f:
            f.write(base64.b64decode(b"".fromhex(request.json["settings"])))
        return "", 200


@app.route("/api/repos/of/<user>")
def repos_repos_of(user):
    repos = get_repos_of(user)
    return jsonify(repos)
