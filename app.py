import os
from flask import send_from_directory
from taj.endpoints import *
from taj.orm import init_db


@app.route("/", defaults={'path': ''})
@app.route("/<path:path>")
def serve(path):
    build_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend", "build")
    if path and os.path.exists(os.path.join(build_path, path)):
        return send_from_directory(build_path, path)
    else:
        return send_from_directory(build_path, "index.html")


if __name__ == "__main__":
    init_db()
    app.run(debug=True, threaded=True)
