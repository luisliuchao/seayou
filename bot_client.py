import sea_api
from consts import MessageDirection, MessageType
from convex_api import convex_client
from utils import (
    format_with_tag,
    get_timestamp,
    get_user_profile,
    has_frontend,
    post_request,
)

# ref: https://open.seatalk.io/docs/list-of-events
EVENT_VERIFICATION = "event_verification"
NEW_BOT_SUBSCRIBER = "new_bot_subscriber"
MESSAGE_FROM_BOT_SUBSCRIBER = "message_from_bot_subscriber"
INTERACTIVE_MESSAGE_CLICK = "interactive_message_click"


def handle_new_subscriber(**kwargs):
    employee_code = kwargs.get("employee_code", "")
    user_profile = get_user_profile(employee_code)

    if user_profile:
        reply_message = f"Hi, {user_profile.get('name')}! Nice to meet you!"
    else:
        reply_message = "Hi, nice to meet you!"
    sea_api.direct_message(employee_code, reply_message)


def handle_subscriber_message(**kwargs):
    text_content = kwargs.get("text_content", "")
    employee_code = kwargs.get("employee_code", "")

    if convex_client:
        # record the message
        convex_client.mutation(
            "messages:add",
            {
                "direction": MessageDirection.INCOMING,
                "employee_code": employee_code,
                "body_type": MessageType.TEXT,
                "body": text_content,
            },
        )
        user_profile = get_user_profile(employee_code)

        # update the user's unread_count and last_message_at
        if user_profile:
            unread_count = user_profile.get("unread_count", 0)
            convex_client.mutation(
                "users:update",
                {
                    "id": user_profile["_id"],
                    "payload": {
                        "unread_count": unread_count + 1,
                        "last_message_at": get_timestamp(),
                    },
                },
            )

    if not has_frontend:
        reply_message = f"You said: {text_content}"
        sea_api.direct_message(employee_code, reply_message)


def handle_manual_reply(**kwargs):
    employee_code = kwargs.get("employee_code", "")
    reply_message = kwargs.get("text_content", "")
    sea_api.direct_message(employee_code, reply_message)


def handle_send_to_all(**kwargs):
    text_content = kwargs.get("text_content", "")

    if not convex_client:
        return

    all_profiles = convex_client.query("users:list", {})
    to_employee_codes = [profile.get("employee_code") for profile in all_profiles]

    data = {
        "text_content": text_content,
        "to_employee_codes": to_employee_codes,
    }
    post_request("api/broadcast-message", data)


def handle_broadcast_message(**kwargs):
    text_content = kwargs.get("text_content", "")
    to_employee_codes = kwargs.get("to_employee_codes", [])

    print("to_employee_codes", to_employee_codes)

    # only allow max 20 requests to be send in one request to fix the vercel 10s timeout issue
    max_requests = 20
    employee_codes = to_employee_codes[:max_requests]
    remaining_employee_codes = to_employee_codes[max_requests:]

    for employee_code in employee_codes:
        data = {
            "employee_code": employee_code,
            "text_content": text_content,
        }
        post_request("api/manual-reply", data)

    # broadcast to the remaining users
    if len(remaining_employee_codes):
        data = {
            "text_content": text_content,
            "to_employee_codes": remaining_employee_codes,
        }
        post_request("api/broadcast-message", data)


def handle_send_to_group(**kwargs):
    group_id = kwargs.get("group_id", "")
    text_content = kwargs.get("text_content", "")

    if not group_id or not text_content:
        return {"error": "missing group_id or text_content"}

    formatted_content = format_with_tag(text_content)

    return sea_api.group_message(group_id, formatted_content)
