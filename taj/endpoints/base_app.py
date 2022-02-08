from flask import Flask
from flask_cors import CORS

app = Flask(__name__, static_url_path="", static_folder="frontend/build")
CORS(app)
