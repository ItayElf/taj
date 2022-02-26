import base64
import io
import os
import sys

from taj.endpoints import app
from taj.orm.repos import get_all_repos, get_repo, get_repos_of, get_files_of_repo, insert_repo, add_contributor, \
    get_file_content

from flask import jsonify, request, send_file

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
        if "username" not in request.json or "token" not in request.json:
            return "Missing username or token in json", 400
        username = request.json.get("username")
        token = request.json.get("token")
        if not does_user_exist(username):
            return f"User {username} was not found", 404
        if not validate_token(username, token):
            return "Token is incorrect or expired", 403
        if "db" not in request.json or "settings" not in request.json:
            return "Missing db file or settings in json", 400
        if "new" not in request.json:
            return "Missing new in json", 400
        new = request.json.get("new")
        if not request.json["db"] or not request.json["settings"]:
            return "Invalid files (db or settings)", 400
        dir_path = os.path.join(ROOT_PATH, "dbs", "users", username, repo)
        # try:
        if not os.path.isdir(dir_path):
            if not new:
                return f"No repository with name {repo} was found.", 404
            os.mkdir(dir_path)
            insert_repo(username, repo)
        elif new:
            return f"Repository with name {repo} already exists.", 406
        add_contributor(username, repo)
        # except FileNotFoundError as e:
        #     return str(e), 404
        with open(os.path.join(dir_path, "db.db"), "wb+") as f:
            f.write(base64.b64decode(b"".fromhex(request.json["db"])))
        with open(os.path.join(dir_path, "settings.json"), "wb+") as f:
            f.write(base64.b64decode(b"".fromhex(request.json["settings"])))
        return "", 200


@app.route("/api/repos/of/<user>")
def repos_repos_of(user):
    repos = get_repos_of(user)
    return jsonify(repos)


@app.route("/api/repos/<repo>/files")
def repos_files(repo):
    directory = request.args.get("directory", default="")
    try:
        files = get_files_of_repo(repo, directory)
        return jsonify(files)
    except FileNotFoundError as e:
        return str(e), 404


@app.route("/api/repos/<repo>/file/<path:file>/")
def repos_get_file(repo, file):
    try:
        return jsonify(get_file_content(repo, file))
    except FileNotFoundError as e:
        return str(e), 404


@app.route("/api/repos/<repo>/image/<path:image>")
def repos_serve_image(repo, image):
    try:
        img = b"".fromhex(get_file_content(repo, image)["content"])
        return send_file(io.BytesIO(img), mimetype="image/jpg")
    except FileNotFoundError as e:
        return str(e), 404
