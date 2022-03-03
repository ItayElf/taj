import threading
import time

from flask import send_from_directory
from taj.endpoints import *
from taj.orm import init_db
from taj.orm.users import get_profile_pic, clean_tokens, interval


@app.route("/", defaults={'path': ''})
@app.route("/<path:path>")
def serve(path):
    build_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend", "build")
    if path and os.path.exists(os.path.join(build_path, path)):
        return send_from_directory(build_path, path)
    else:
        return send_from_directory(build_path, "index.html")


@app.errorhandler(404)
def not_found(_):
    build_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend", "build")
    return send_from_directory(build_path, "index.html")


@app.route("/user/<user>/profile_pic")
def user_profile_pic(user):
    try:
        image = get_profile_pic(name=user)
        return send_file(io.BytesIO(image), mimetype="image/jpg")
    except FileNotFoundError as e:
        return str(e), 404


def clean():
    while True:
        clean_tokens()
        time.sleep(interval)


if __name__ == "__main__":
    init_db()
    threading.Thread(target=clean, daemon=True).start()
    app.run(debug=True, threaded=True, ssl_context=("cert.pem", "key.pem"))
