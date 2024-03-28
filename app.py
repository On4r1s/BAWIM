import json

import flask
from flask import Flask, render_template

app = Flask(__name__, template_folder='templates')
app.config['UPLOAD_FOLDER'] = '/static/uploads/'
my_json = json.load(open('settings.json'))
status = {
    "online": "🟢 Online",
    "idle": "🟡 Idle",
    "dnd": "🔴 Do not disturb",
}
activity = ['playing', 'streaming', 'listening', 'watching', 'competing']
langs = {
    "en": "English",
    "ru": "Russian"
}


@app.get('/')
@app.get('/personalize')
def personalize_get(menu='personalize'):
    return render_template('hello.html', menu=menu, settings=my_json[menu], status=status, activity=activity)


@app.post('/')
@app.post('/personalize')
def personalize_post(menu='personalize'):
    print(flask.request.form.to_dict())
    return render_template('hello.html', menu=menu, settings=my_json[menu], status=status, activity=activity)


@app.get('/settings')
def settings_get(menu='settings'):
    return render_template('hello.html', menu=menu, settings=my_json[menu], langs=langs)


@app.post('/settings')
def settings_post(menu='settings'):
    print(flask.request.form.to_dict())
    return render_template('hello.html', menu=menu, settings=my_json[menu], langs=langs)


@app.get('/commands')
def commands_get(menu='commands'):
    return render_template('hello.html', menu=menu, settings=my_json[menu])


@app.post('/commands')
def commands_post(menu='commands'):
    print(flask.request.form.to_dict())
    return render_template('hello.html', menu=menu, settings=my_json[menu])


@app.get('/admins')
def admins_get(menu='admins'):
    return render_template('hello.html', menu=menu, settings=my_json[menu])


@app.post('/admins')
def admins_post(menu='admins'):
    print(flask.request.form.to_dict())
    return render_template('hello.html', menu=menu, settings=my_json[menu])
