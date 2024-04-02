from flask import Flask, jsonify, render_template
import json

app = Flask(__name__, static_folder='static', static_url_path="/static")
app.config['UPLOAD_FOLDER'] = '/static/uploads/'
img_name = json.load(open('settings.json'))['personalize']['avatar']


@app.route("/heartbeat")
def heartbeat():
    return jsonify({"status": "healthy"})


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return render_template("spa.html")


@app.get('/settings.json')
def get_settings():
    return open('settings.json')


@app.get(f'/{img_name}')
def get_img():
    return open(f'static/upload/{img_name}', "rb")
