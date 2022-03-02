import base64
import io
import os
import sys
from zipfile import ZipFile

from taj.endpoints import app
from taj.orm.repos import get_all_repos, get_repo, get_repos_of, get_files_of_repo, insert_repo, add_contributor, \
    get_file_content, update_repo, get_all_files, get_commits_of

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
            commits = [{**c.__dict__, "file_changes": []} for c in get_commits_of(r.name)]
            a = {**r.__dict__, "commits": commits}
            return jsonify(a)
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
        elif username not in get_repo(repo).contributors:
            return "You are not a contributor of this repo", 403
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
    commit = request.args.get("commit", default="")
    try:
        files = get_files_of_repo(repo, directory, commit)
        return jsonify(files)
    except FileNotFoundError as e:
        return str(e), 404


@app.route("/api/repos/<repo>/file/<path:file>/")
def repos_get_file(repo, file):
    commit = request.args.get("commit", "")
    try:
        return jsonify(get_file_content(repo, file, commit))
    except FileNotFoundError as e:
        return str(e), 404


@app.route("/api/repos/<repo>/image/<path:image>")
def repos_serve_image(repo, image):
    commit = request.args.get("commit", "")
    try:
        img = b"".fromhex(get_file_content(repo, image, commit)["content"])
        return send_file(io.BytesIO(img), mimetype="image/jpg")
    except FileNotFoundError as e:
        return str(e), 404


@app.route("/api/repos/<repo>/download/<path:file>")
def repos_download_file(repo, file):
    commit = request.args.get("commit", "")
    try:
        metadata = get_file_content(repo, file, commit)
        content = metadata["content"]
        content = b"".fromhex(content) if metadata["binary"] else content.encode()
        name = os.path.normpath(file).split(os.path.sep)[-1]
        return send_file(io.BytesIO(content), as_attachment=True, attachment_filename=name)
    except FileNotFoundError as e:
        return str(e), 404


@app.route("/api/repos/<repo>.zip")
def repos_download_repo(repo):
    commit = request.args.get("commit", "")
    try:
        files = get_all_files(repo, commit)
    except FileNotFoundError as e:
        return str(e), 404
    in_mem = io.BytesIO()
    archive = ZipFile(in_mem, "w")
    for file in files:
        archive.writestr(file, files[file])
    archive.close()
    return send_file(io.BytesIO(in_mem.getvalue()), as_attachment=True, attachment_filename=f"{repo}.zip")


@app.route("/api/repos/<repo>/edit", methods=["POST"])
def repos_edit_repo(repo):
    if "username" not in request.json or "token" not in request.json:
        return "Missing username or token in json", 400
    username = request.json.get("username")
    token = request.json.get("token")
    if not does_user_exist(username):
        return f"User {username} was not found", 404
    if not validate_token(username, token):
        return "Token is incorrect or expired", 403
    try:
        r = get_repo(repo)
    except FileNotFoundError as e:
        return str(e), 404
    if username not in r.contributors:
        return "Cannot edit repository you are not a contributor of", 403
    description = request.json.get("description")
    contributors = request.json.get("contributors")
    if description:
        r.description = description
    if contributors and type(contributors) is list:
        r.contributors = contributors
    try:
        update_repo(r)
    except FileNotFoundError as e:
        return str(e), 404
    return jsonify(r)
