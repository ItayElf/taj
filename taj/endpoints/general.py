from flask import request, jsonify

from taj.endpoints import app
from taj.orm.repos import search_repos
from taj.orm.users import search_users


@app.route("/api/search")
def general_search():
    if "query" not in request.args:
        return "Missing query in args", 400
    query = request.args.get("query")
    users = search_users(query)
    repos = search_repos(query)
    return jsonify({"users": sorted(users), "repos": sorted(repos, key=lambda x: x.name)})
