import json
import requests


def fetch(token, users):
    headers = {'Authorization': f'Bot {token}'}
    answers = {}
    for user_id in users:
        answer = requests.get(f"https://discord.com/api/v9/users/{user_id}", headers=headers)
        if answer.status_code == 200:
            my_json = answer.content.decode('utf8').replace("'", '"')
            answers.update({user_id: json.loads(my_json)})
        else:
            print('ERROR: ' + str(answer.status_code))
    return answers
