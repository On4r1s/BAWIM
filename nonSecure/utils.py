import json
import datetime
import requests


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
