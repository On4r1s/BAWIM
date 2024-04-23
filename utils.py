import json
from datetime import datetime

import requests
import re


class ValidationException(Exception):
    pass


def fetch(token, users):
    headers = {'Authorization': f'Bot {token}'}
    answers = {}
    for user_id in users:
        answer = requests.get(f"https://discord.com/api/v9/users/{user_id}", headers=headers)
        if answer.status_code == 200:
            get_json = answer.content.decode('utf8').replace("'", '"')
            answers.update({user_id: json.loads(get_json)})
        else:
            print('ERROR in fetching: ' + str(answer.status_code))
    return answers


def validate(group, key, val, owner_id, command_list):
    reg_name = """^[^\s\0@#:"'`\x07\x08\x0B\x0C\x0E-\x1F]{1,100}$"""
    reg_text = """^[^\0@#:"'`\x07\x08\x0B\x0C\x0E-\x1F]{1,100}$"""
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
            elif not re.findall(reg_name, val.lower(), re.IGNORECASE):
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
                        if val['Role'] != 'Admin':
                            raise ValidationException
                        try:
                            int(val['InvitedBy'])
                            if not (17 <= len(val['InvitedBy']) <= 19):
                                raise ValidationException
                        except ValueError:
                            if val['InvitedBy'] != 'Bot':
                                raise ValidationException
                        if val['InviteDate'] >= datetime.utcnow().strftime("%Y-%m-%d"):
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
