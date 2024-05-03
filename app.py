import os
from base64 import b64decode
from io import BytesIO
from uuid import uuid4

from PIL import Image, UnidentifiedImageError
from flask import Flask, render_template, request, Response, jsonify
from utils import *

app = Flask(__name__, static_folder='static', static_url_path="/static")
app.config['UPLOAD_FOLDER'] = 'static/upload/'
app_token = 'MTIwMTE3MDg2Njk4MjEwNTI4MA.GpItjr.0MdKCF9tx5TjvNxmsyRzrJRNFnZYbyfPyEHfCw'
app_secret = 'hnbkHKXeQBMfP93FyExJR_j3NZQ3DSn3'
temp = {'359412965843140609': {'id': '359412965843140609', 'username': 'on4r1s',
                               'avatar': '1fc68c35b78fe8ac26f622508e4c009c', 'discriminator': '0',
                               'public_flags': 4194560, 'flags': 4194560, 'banner': None, 'accent_color': None,
                               'global_name': 'օռʊʀɨֆ', 'avatar_decoration_data': None, 'banner_color': None},
        '771379008323584022': {'id': '771379008323584022', 'username': 'bl1at.',
                               'avatar': 'a75f31a4683f0ac2d43bc5571d6f73a3', 'discriminator': '0', 'public_flags': 0,
                               'flags': 0, 'banner': None, 'accent_color': None, 'global_name': 'блять',
                               'avatar_decoration_data': None, 'banner_color': None}}
owner_id = list(json.load(open('settings.json'))['admins'].keys())[0]


@app.route("/heartbeat")
def heartbeat():
    return jsonify({"status": "healthy"})


@app.get('/', defaults={'path': ''})
@app.get('/<path:path>')
def catch_all(path):
    return render_template("spa.html")


@app.get('/settings.json')
def get_settings():
    try:
        file = open('settings.json', 'rb')
        # checking credentials
        list(json.load(file)['admins'].keys()).index(request.headers['Id'])
        check_user(request.headers['Id'], request.headers['Access-Token'], request.headers['Token-Type'])

    except FileNotFoundError:
        return Response(status=404)
    except ValueError:
        return Response(status=403)
    except UserAuthenticationException:
        return Response(status=401)
    except KeyError:
        return Response(status=400)
    file.seek(0)
    return file


@app.post('/settings.json')
def update_info():
    try:
        # checking credentials
        list(json.load(open('settings.json', 'rb'))['admins'].keys()).index(request.headers['Id'])
        check_user(request.headers['Id'], request.headers['Access-Token'], request.headers['Token-Type'])
        post_json = json.loads(request.get_data())

        # checking for new img
        img_name = None
        try:
            img = Image.open(BytesIO(b64decode(post_json['newimage'])))
            img_name = str(uuid4().hex) + '.' + img.format.lower()
            img.save(os.path.join(app.config['UPLOAD_FOLDER'], img_name))
            post_json.pop('newimage')
        except (UnidentifiedImageError, TypeError):
            return Response(status=400)
        except KeyError:
            pass

        # validation
        actual_settings = json.load(open('settings.json'))
        for group in post_json:
            for key in post_json[group]:
                if group == 'commands':
                    command_list = list(actual_settings['commands'][key].keys())
                else:
                    command_list = None
                if key != 'avatar':
                    try:
                        if validate(group, key, post_json[group][key], owner_id, command_list) is not None:
                            actual_settings[group].pop(key)
                        else:
                            actual_settings[group][key] = post_json[group][key]
                    except ValidationException:
                        return Response(status=400)
                else:
                    actual_settings[group][key] = img_name

        # save new settings
        json.dump(actual_settings, open('settings.json', 'w'))

        # response
        return Response(headers={'img-name': actual_settings['personalize']['avatar']}, status=204)

    except (json.JSONDecodeError, TypeError, KeyError) as e:
        print(e)
        return Response(status=400)
    except ValueError:
        return Response(status=403)
    except UserAuthenticationException:
        return Response(status=401)


@app.get('/admin_list.json')
def get_admins():
    try:
        # checking credentials
        list(json.load(open('settings.json', 'rb'))['admins'].keys()).index(request.headers['Id'])
        check_user(request.headers['Id'], request.headers['Access-Token'], request.headers['Token-Type'])

        if request.headers['req-admin'] == 'all':
            output = fetch(app_token, json.load(open('settings.json'))['admins'])
            # output = temp
        else:
            output = fetch(app_token, [request.headers['req-admin']])
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
