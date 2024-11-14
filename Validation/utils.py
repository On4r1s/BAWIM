import json
import datetime

import requests
import re


class ValidationException(Exception):
    pass


class UserAuthenticationException(Exception):
    pass


def fetch(token, users):
    headers = {'Authorization': f'Bot {token}'}
    answers = {}
    for user_id in users:
        answer = requests.get(f"https://discord.com/api/v9/users/{user_id}", headers=headers)
        get_json = answer.content.decode('utf8').replace("'", '"')
        answers.update({user_id: json.loads(get_json)})
    return answers


def validate(group, key, val, owner_id, command_list):
    reg_name = """^[^\s\0@#:"'`\x07\x08\x0B\x0C\x0E-\x1F]{1,}$"""
    reg_text = """^[^\0@#:"'`\x07\x08\x0B\x0C\x0E-\x1F]{1,}$"""
    reg_prefix = """^[^\0"'`\x07\x08\x0B\x0C\x0E-\x1F]{1,3}$"""
    forbidden_words = ['everyone', 'here', 'discord']
    status_list = ["online", "idle", "dnd"]
    activity_list = ['playing', 'streaming', 'listening', 'watching', 'competing']
    language_list = ['en', 'ru']
    if group == 'personalize':
        if key == 'name':
            if not (2 <= len(val) <= 32):
                raise ValidationException
            elif not re.findall(reg_name, val.lower(), re.IGNORECASE):
                raise ValidationException
            else:
                try:
                    forbidden_words.index(val)
                    raise ValidationException
                except ValueError:
                    pass
        elif key == 'status':
            if val not in status_list:
                raise ValidationException
        elif key == 'activity':
            if val not in activity_list:
                raise ValidationException
        elif key == 'activity_text':
            if not (1 <= len(val) <= 100):
                raise ValidationException
            elif not re.findall(reg_text, val.lower(), re.IGNORECASE):
                raise ValidationException
        else:
            raise ValidationException

    elif group == 'commands':
        actual_key = list(val.keys())[0]
        if not (val[list(val.keys())[0]] == 0 or val[list(val.keys())[0]] == 1):
            raise ValidationException
        try:
            command_list.index(actual_key)
        except ValueError:
            raise ValidationException

    elif group == 'settings':
        if key == 'lang':
            if val not in language_list:
                raise ValidationException
        elif key == 'prefix':
            if not (1 <= len(val) <= 3):
                raise ValidationException
            elif not re.findall(reg_prefix, val.lower(), re.IGNORECASE):
                raise ValidationException
        else:
            raise ValidationException

    elif group == 'admins':
        try:
            int(key)
            if key != owner_id:
                if isinstance(val, str):
                    if val == 'deleted':
                        return key
                    else:
                        raise ValidationException
                elif isinstance(val, dict):
                    try:
                        if val['role'] != 'Admin':
                            raise ValidationException
                        try:
                            int(val['invitedBy'])
                            if not (17 <= len(val['invitedBy']) <= 19):
                                raise ValidationException
                        except ValueError:
                            if val['invitedBy'] != 'Bot':
                                raise ValidationException
                        today = datetime.datetime.now(datetime.UTC)
                        yesterday = today - datetime.timedelta(1)
                        if yesterday.strftime("%Y-%m-%d") >= val['inviteDate'] >= today.strftime("%Y-%m-%d"):
                            raise ValidationException
                    except KeyError:
                        raise ValidationException
                else:
                    raise ValidationException
            else:
                raise ValidationException
        except ValueError:
            raise ValidationException
    else:
        raise ValidationException


def fetch_user_data(token, token_type):
    resp = requests.get('https://discord.com/api/users/@me', headers={'Authorization': f'{token_type} {token}'})
    if resp.status_code != 200:
        raise UserAuthenticationException
    else:
        return resp.json()


user_login_temp = {}


def check_user(user_id, token, token_type):
    try:
        if user_login_temp[user_id][token] > datetime.datetime.now(datetime.UTC):
            return
        else:
            user_login_temp[user_id].pop(token)
            raise UserAuthenticationException
    except KeyError:
        resp = fetch_user_data(token, token_type)
        if resp['id'] == user_id:
            user_login_temp[user_id] = {token: datetime.datetime.now(datetime.UTC) + datetime.timedelta(1)}
            return
        else:
            raise UserAuthenticationException
