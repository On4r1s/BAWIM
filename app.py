from flask import Flask, jsonify, render_template, request
import json
import admin
app = Flask(__name__, static_folder='static', static_url_path="/static")
app.config['UPLOAD_FOLDER'] = '/static/uploads/'
img_name = json.load(open('settings.json'))['personalize']['avatar']
app_token = 'MTIwMTE3MDg2Njk4MjEwNTI4MA.GpItjr.0MdKCF9tx5TjvNxmsyRzrJRNFnZYbyfPyEHfCw'
temp = {'359412965843140609': {'id': '359412965843140609', 'username': 'on4r1s', 'avatar': '1fc68c35b78fe8ac26f622508e4c009c', 'discriminator': '0', 'public_flags': 4194560, 'flags': 4194560, 'banner': None, 'accent_color': None, 'global_name': 'օռʊʀɨֆ', 'avatar_decoration_data': None, 'banner_color': None}, '771379008323584022': {'id': '771379008323584022', 'username': 'bl1at.', 'avatar': 'a75f31a4683f0ac2d43bc5571d6f73a3', 'discriminator': '0', 'public_flags': 0, 'flags': 0, 'banner': None, 'accent_color': None, 'global_name': 'блять', 'avatar_decoration_data': None, 'banner_color': None}}


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


@app.get('/admin_list.json')
def get_admins():
    if request.headers['req-admin'] == 'all':
        #output = admin.fetch(app_token, json.load(open('settings.json'))['admins'])
        output = temp
    else:
        output = admin.fetch(app_token, [request.headers['req-admin']])
    return output


@app.get(f'/{img_name}')
def get_img():
    return open(f'static/upload/{img_name}', "rb")
