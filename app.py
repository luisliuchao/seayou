import hashlib
import json
import logging

from flask import Flask, make_response, render_template, request

import bot_client
from env import AUTH_SECRET, BOT_SIGNING_SECRET
from utils import has_frontend

app = Flask(
    __name__, template_folder="frontend/dist", static_folder="frontend/dist/assets"
)

app.logger.setLevel(logging.INFO)
logger = app.logger

# ref: https://open.seatalk.io/docs/list-of-events
EVENT_VERIFICATION = "event_verification"
NEW_BOT_SUBSCRIBER = "new_bot_subscriber"
MESSAGE_FROM_BOT_SUBSCRIBER = "message_from_bot_subscriber"
INTERACTIVE_MESSAGE_CLICK = "interactive_message_click"


def require_login(func):
    def wrapper(**kwargs):
        # check x-secret in the cookie of the request
        secret = request.cookies.get("x-secret", "")
        if secret != AUTH_SECRET:
            response = make_response({"error": "invalid_secret"})
            response.delete_cookie("x-secret")
            response.status_code = 401
            return response
        else:
            return func(**kwargs)

    wrapper.__name__ = func.__name__
    return wrapper


def extract_data(func):
    def wrapper():
        body = request.get_data() or "{}"
        data = json.loads(body)
        app.logger.info(f"handle request with function {func.__name__} and data {data}")
        return func(data)

    wrapper.__name__ = func.__name__
    return wrapper


def is_valid_signature(signing_secret, body, signature):
    # ref: https://open.seatalk.io/docs/server-apis-event-callback
    return hashlib.sha256(body + signing_secret).hexdigest() == signature


@app.route("/", methods=["POST"])
@extract_data
def bot_callback_handler(data):
    body = request.get_data()
    signature = request.headers.get("signature")

    # 1. validate the signature
    if not is_valid_signature(BOT_SIGNING_SECRET, body, signature):
        app.logger.info("Wrong signature: %s", signature)
        return "error_signature_mismatch"

    # 2. handle events
    event_id = data.get("event_id", "")
    event_type = data.get("event_type", "")
    event = data.get("event", {})
    employee_code = event.get("employee_code", "")
    text_content = event.get("message", {}).get("text", {}).get("content", "")

    app.logger.info("Callback received: %s", data)

    if event_type == EVENT_VERIFICATION:
        return event
    elif event_type == NEW_BOT_SUBSCRIBER:
        data = {
            "employee_code": employee_code,
        }
        bot_client.handle_new_subscriber(**data)
        return "success_new_subscriber"
    elif event_type == MESSAGE_FROM_BOT_SUBSCRIBER:
        data = {
            "event_id": event_id,
            "employee_code": employee_code,
            "text_content": text_content,
        }
        bot_client.handle_subscriber_message(**data)
        return "success_new_message"
    else:
        return "error_unknown_event_type"


@app.route("/api/manual-reply", methods=["POST"])
@require_login
@extract_data
def manual_reply_handler(data):
    app.logger.info("handle manual reply %s", data)
    bot_client.handle_manual_reply(**data)
    return ""


@app.route("/api/send-to-group", methods=["POST"])
@require_login
@extract_data
def send_to_group_handler(data):
    app.logger.info("handle send to group %s", data)
    return bot_client.handle_send_to_group(**data)


@app.route("/api/check_login", methods=["POST"])
@require_login
@extract_data
def check_login_handler(data):
    app.logger.info("handle check login %s", data)
    return ""


@app.route("/api/send-to-all", methods=["POST"])
@require_login
@extract_data
def send_to_all_handler(data):
    app.logger.info("handle send to all %s", data)
    bot_client.handle_send_to_all(**data)
    return ""


@app.route("/api/broadcast-message", methods=["POST"])
@require_login
@extract_data
def broadcast_message_handler(data):
    app.logger.info("handle broadcast message %s", data)
    bot_client.handle_broadcast_message(**data)
    return ""


@app.route("/api/login", methods=["POST"])
@extract_data
def login_handler(data):
    app.logger.info("handle login %s", data)
    secret = data["secret"]
    if secret != AUTH_SECRET:
        response = make_response({"error": "invalid_secret"})
        response.status_code = 401
        response.delete_cookie("x-secret")
        return response
    else:
        # set cookie in the response
        response = make_response("success")
        response.set_cookie("x-secret", secret)
        return response


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def index(path):
    if has_frontend:
        return render_template("index.html")
    else:
        return "Great! You have successfully deployed your SeaTalk bot."


if __name__ == "__main__":
    app.run(port=5001, debug=True)
