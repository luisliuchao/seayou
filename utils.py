import re
import time
from urllib.parse import urlparse

import requests
from flask import request

import sea_api
from convex_api import convex_client
from env import AUTH_SECRET, CONVEX_DEPLOY_KEY

has_frontend = CONVEX_DEPLOY_KEY


def get_timestamp():
    return int(time.time() * 1000)


def post_request(path, data):
    o = urlparse(request.base_url)
    url = f"{o.scheme}://{o.hostname}{':' + str(o.port) if o.port else ''}/{path}"
    try:
        requests.post(
            url, json=data, timeout=0.2, headers={"Cookie": f"x-secret={AUTH_SECRET}"}
        )
    except Exception:
        pass


def get_user_profile(employee_code):
    if convex_client:
        user_profile = convex_client.query(
            "users:get", {"employee_code": employee_code}
        )
        if not user_profile:
            user_profile = sea_api.fetch_user_profile(employee_code)
            if user_profile:
                convex_client.mutation("users:add", user_profile)
    else:
        user_profile = sea_api.fetch_user_profile(employee_code)

    return user_profile


def format_with_tag(text_content):
    # replace @all with <mention-tag target="seatalk://user?id=0"/>
    text_content = text_content.replace(
        "@all", '<mention-tag target="seatalk://user?id=0"/>'
    )

    # replace @abc@def.xyz with <mention-tag target="seatalk://user?email=abc@def.xyz"/>
    text_content = re.sub(
        r"@(\S+@\S+)", r'<mention-tag target="seatalk://user?email=\1"/>', text_content
    )

    return text_content
