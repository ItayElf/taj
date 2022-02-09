from flask import Flask
from flask_cors import CORS
import os

_static_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "frontend", "build")
app = Flask(__name__, static_url_path="", static_folder=_static_path)
CORS(app)
