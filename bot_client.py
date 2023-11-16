import sea_api
from consts import MessageDirection, MessageType
from convex_api import convex_client
from utils import (
    format_with_tag,
    get_group_profile,
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
                    "employee_code": employee_code,
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


def handle_bot_added_to_group(**event):
    group_id = event.get("group", {}).get("group_id", "")
    group = get_group_profile(group_id)

    # inform the inviter
    inviter_employee_code = event.get("inviter", {}).get("employee_code", "")
    if inviter_employee_code:
        sea_api.direct_message(
            inviter_employee_code,
            f"Thanks for inviting me to {group.get('group_name')} (group_id: {group.get('group_id')}).",
        )


def handle_group_mention_message(**event):
    group_id = event.get("group_id", "")
    message = event.get("message", {})
    text_content = message.get("text", {}).get("plain_text", "")
    sender_employee_code = message.get("sender", {}).get("employee_code", "")
    mentioned_list = message.get("text", {}).get("mentioned_list", [])

    for mention in mentioned_list:
        username = mention.get("username", "")
        seatalk_id = mention.get("seatalk_id", "")
        if f"@{username}" in text_content:
            text_content = text_content.replace(
                f"@{username}", f"@{username} ({seatalk_id})"
            )

    if convex_client:
        group = get_group_profile(group_id)

        if group:
            # record the message
            convex_client.mutation(
                "messages:add",
                {
                    "direction": MessageDirection.INCOMING,
                    "employee_code": sender_employee_code,
                    "body_type": MessageType.TEXT,
                    "body": text_content,
                    "group_id": group.get("group_id"),
                    "group_name": group.get("group_name"),
                },
            )

            # update the user's unread_count and last_message_at
            unread_count = group.get("unread_count", 0)
            convex_client.mutation(
                "groups:update",
                {
                    "group_id": group_id,
                    "payload": {
                        "unread_count": unread_count + 1,
                        "last_message_at": get_timestamp(),
                    },
                },
            )


def handle_bot_removed_from_group(**event):
    group_id = event.get("group_id", "")

    if convex_client:
        convex_client.mutation(
            "groups:update",
            {
                "group_id": group_id,
                "payload": {
                    "is_subscriber": False,
                },
            },
        )
