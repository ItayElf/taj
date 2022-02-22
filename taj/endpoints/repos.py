from taj.endpoints import app
from taj.orm.repos import get_all_repos, get_repo, get_repos_of

from flask import jsonify, request


@app.route("/api/repos")
def repos_all_repos():
    all_repos = get_all_repos()
    return jsonify(all_repos)


@app.route("/api/repos/<repo>")
def repos_get_repo(repo):
    try:
        r = get_repo(repo)
        return jsonify(r)
    except FileNotFoundError as e:
        return str(e), 404


@app.route("/api/repos/of/<user>")
def repos_repos_of(user):
    repos = get_repos_of(user)
    return jsonify(repos)
