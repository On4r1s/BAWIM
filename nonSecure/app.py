import os
from base64 import b64decode
from io import BytesIO
from uuid import uuid4
from PIL import Image, UnidentifiedImageError
from flask import Flask, render_template, request, Response, jsonify
from utils import *
import sqlite3

conn = sqlite3.connect(os.getcwd() + '\\Bawim.db', check_same_thread=False)
cursor = conn.cursor()

app = Flask(__name__, static_folder='static', static_url_path="/static")
app.config['UPLOAD_FOLDER'] = 'static/upload/'
app_token = os.environ.get('APP_TOKEN')
app_secret = os.environ.get('APP_SECRET')

cursor.execute("""SELECT Id FROM Admins WHERE Role = 'Owner';""")
owner_id = cursor.fetchall()


def check_credentials(headers):
    if headers['id'] == 'admin' and headers['Access-Token'] == 'admin':  # _temporary for testing_
        return False
    cursor.execute(f"""SELECT Id FROM Admins WHERE Id = '{headers['Id']}';""")
    if len(cursor.fetchall()) == 0:
        return True
    check_user(headers['Id'], headers['Access-Token'], headers['Token-Type'])
    return False


def get_settings():
    cursor.execute(f"""SELECT * from Settings;""")
    out = cursor.fetchall()[0]
    my_dict = {'personalize': {'avatar': out[0],
                               'name': out[1],
                               'status': out[2],
                               'activity': out[3],
                               'activity_text': out[4]},
               'settings': {'prefix': out[6]},
               'admins': {}}
    cursor.execute(f"""SELECT * from Admins;""")
    out = cursor.fetchall()
    for elem in out:
        my_dict['admins'][elem[0]] = {"role": elem[1],
                                      "invitedBy": elem[2],
                                      "invitedDate": elem[3]}
    cursor.execute(f"""SELECT * from Commands;""")
    out = cursor.fetchall()
    comms = {"hybrid": {}, "slash": {}, "prefix": {}, "application": {}}
    for elem in out:
        comms[elem[2]][elem[0]] = elem[1]
    my_dict["commands"] = comms
    out = json.dumps(my_dict, indent=4)
    return out


def get_admins_id():
    cursor.execute(f"""SELECT Id from Admins""")
    out = cursor.fetchall()
    return [y[0] for y in out]


def update_settings(group, key, val):
    if group == 'settings' or group == 'personalize':
        print(f"""UPDATE Settings SET ({key}) = ('{val}')""")
        cursor.execute(f"""UPDATE Settings SET ({key}) = ('{val}')""")
    elif group == 'commands':
        cursor.execute(f"""UPDATE Commands SET ({key}) = ('{val}') WHERE Name = {key};""")
    elif group == 'admins':
        vals = str(list(val.values()))[1:-1]
        vals = f"""'{key}', {vals}"""
        cursor.execute(f"""INSERT INTO Admins VALUES ({vals});""")
    else:
        raise KeyError


def delete_admin(a_id):
    cursor.execute(f"""DELETE FROM Admins WHERE Id = '{a_id}';""")


@app.route("/heartbeat")
def heartbeat():
    return jsonify({"status": "healthy"})


@app.get('/', defaults={'path': ''})
@app.get('/<path:path>')
def catch_all(path):
    return render_template("spa.html")


@app.get('/settings.json')
def get_settings_web():
    try:
        if check_credentials(request.headers):
            Response(status=401)
        else:
            pass
    except (KeyError, UserAuthenticationException):
        return Response(status=400)

    return get_settings()


@app.post('/settings.json')
def update_info():
    try:
        check_credentials(request.headers)
        post_json = json.loads(request.get_data())
        # checking for new img
        img_name = None
        try:  # _killed_
            img = Image.open(BytesIO(b64decode(post_json['newimage'])))
            img_name = str(uuid4().hex) + '.' + img.format.lower()
            img.save(os.path.join(app.config['UPLOAD_FOLDER'], img_name))
            post_json.pop('newimage')
        except KeyError:
            pass

        # _NO_ validation
        for group in post_json:
            for key in post_json[group]:
                if key != 'avatar':
                    if post_json[group][key] == 'delete':
                        delete_admin(key)
                    else:
                        update_settings(group, key, post_json[group][key])
                else:
                    update_settings(group, key, img_name)

        # saving changes
        conn.commit()
        # response
        if img_name is None:
            cursor.execute(f"""SELECT * from Settings;""")
            img_name = cursor.fetchall()[0][0]
        return Response(headers={'img-name': img_name}, status=204)

    except (json.JSONDecodeError, TypeError, KeyError, UserAuthenticationException):
        return Response(status=400)
    except ValueError:
        return Response(status=403)


@app.get('/admin_list.json')
def get_admins_web():
    try:
        check_credentials(request.headers)

        if request.headers['Req-admin'] == 'all':
            output = fetch(app_token, get_admins_id())
            # output = temp
        else:
            output = fetch(app_token, [request.headers['Req-admin']])
    except KeyError:
        return Response(status=400)
    except ValueError:
        return Response(status=403)
    except UserAuthenticationException:
        return Response(status=401)
    return output


@app.get(f'/upload/<path:path>')
def get_img(path):
    try:
        file = open(f'static/upload/{path}', "rb")
    except FileNotFoundError:
        return Response(status=404)
    return file


if __name__ == "__main__":
    app.run()
