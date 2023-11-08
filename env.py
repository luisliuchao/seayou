import os

from dotenv import load_dotenv

load_dotenv(".env")

SEA_APP_ID = os.environ.get("SEA_APP_ID")
SEA_APP_SECRET = os.environ.get("SEA_APP_SECRET")
BOT_SIGNING_SECRET = os.environ.get("BOT_SIGNING_SECRET", "").encode()
CONVEX_URL = os.environ.get("CONVEX_URL")
CONVEX_DEPLOY_KEY = os.environ.get("CONVEX_DEPLOY_KEY")

AUTH_SECRET = os.environ.get("AUTH_SECRET", SEA_APP_SECRET)
