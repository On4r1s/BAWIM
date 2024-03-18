import json

from flask import Flask, render_template

app = Flask(__name__, template_folder='templates')
my_json = json.load(open('settings.json'))
status = {
    "online": "🟢 Online",
    "idle": "🟡 Idle",
    "dnd": "🔴 Do not disturb",
}
activity = ['playing', 'streaming', 'listening', 'watching', 'competing']


@app.route('/')
@app.route('/personalize')
def personalize(menu='personalize'):
    return render_template('hello.html', menu=menu, settings=my_json['personalize'], status=status, activity=activity)


@app.route('/settings')
def settings(menu='settings'):
    return render_template('hello.html', menu=menu, settings=my_json)


@app.route('/admin')
def admins(menu='admin_roles'):
    return render_template('hello.html', menu=menu, settings=my_json)
