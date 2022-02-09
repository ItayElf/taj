from flask import send_from_directory
from taj.endpoints import *
from taj.orm import init_db


@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    init_db()
    app.run()
