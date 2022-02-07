from email.policy import default
from flask import Flask, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_url_path="", static_folder="frontend/build")
CORS(app)


@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    app.run()
