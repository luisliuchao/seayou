import requests

import app
from consts import MessageDirection, MessageType
from convex_api import convex_client
from env import SEA_APP_ID, SEA_APP_SECRET

app_access_token = ""


def create_headers():
    if not app_access_token:
        refresh_app_access_token()

    return {
        "Authorization": "Bearer " + app_access_token,
        "Content-Type": "application/json",
    }


# https://open.seatalk.io/docs/get-app-access-token
def refresh_app_access_token():
    url = "https://openapi.seatalk.io/auth/app_access_token"

    body = {
        "app_id": SEA_APP_ID,
        "app_secret": SEA_APP_SECRET,
    }
    response = requests.post(url, json=body)
    response_data = response.json()

    code = response_data.get("code", None)

    if code == 0:
        token = response_data.get("app_access_token", "")
        app.logger.info("Refresh app access token: %s", token)

        global app_access_token
        app_access_token = token


# https://open.seatalk.io/docs/get-employee-profile
def fetch_user_profile(employee_code):
    url = "https://openapi.seatalk.io/contacts/v2/profile"
    headers = create_headers()
    response = requests.get(
        url, params={"employee_code": employee_code}, headers=headers
    )
    response_data = response.json()

    code = response_data.get("code", None)
    app.logger.info("Get user %s profile with response code %s", employee_code, code)

    if code == 0:
        employees = response_data.get("employees", [])
        employee = next(
            (
                employee
                for employee in employees
                if employee.get("employee_code", "") == employee_code
            ),
            None,
        )
        return employee or {}
    elif code == 100:
        refresh_app_access_token()
        return fetch_user_profile(employee_code)


# https://open.seatalk.io/docs/messaging_send-message-to-bot-subscriber
def direct_message(employee_code, text_content):
    if not employee_code:
        app.logger.error('Reply back failed: user profile has no "employee_code"')
        return

    url = "https://openapi.seatalk.io/messaging/v2/single_chat"
    headers = create_headers()
    data = {
        "employee_code": employee_code,
        "message": {"tag": "text", "text": {"content": text_content}},
    }

    response = requests.post(url, json=data, headers=headers)
    response_data = response.json()
    code = response_data.get("code", None)

    if code == 0:
        app.logger.info(
            'Reply back to %s: "%s" with response code %s',
            employee_code,
            text_content,
            code,
        )
        if convex_client:
            convex_client.mutation(
                "messages:add",
                {
                    "direction": MessageDirection.OUTGOING,
                    "employee_code": employee_code,
                    "body_type": MessageType.TEXT,
                    "body": text_content,
                },
            )
    elif code == 100:
        refresh_app_access_token()
        direct_message(employee_code, text_content)
    elif code == 3002:
        app.logger.error("Reply back failed: user not subscriber")
    elif code == 101:
        app.logger.error("Reply back failed: exceed rate limit")
    else:
        app.logger.error(
            "Reply back failed to %s with response code %s", employee_code, code
        )
