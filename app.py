import os
import io
from flask import send_from_directory, send_file
from taj.endpoints import *
from taj.orm import init_db
from taj.orm.users import get_profile_pic


@app.route("/", defaults={'path': ''})
@app.route("/<path:path>")
def serve(path):
    build_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend", "build")
    if path and os.path.exists(os.path.join(build_path, path)):
        return send_from_directory(build_path, path)
    else:
        return send_from_directory(build_path, "index.html")


@app.route("/<user>/profile_pic")
def user_profile_pic(user):
    try:
        image = get_profile_pic(name=user)
        return send_file(io.BytesIO(image), mimetype="image/jpg")
    except FileNotFoundError as e:
        return str(e), 404


if __name__ == "__main__":
    init_db()
    app.run(debug=True, threaded=True, host="0.0.0.0", ssl_context=("cert.pem", "key.pem"))
