from convex import ConvexClient

from env import CONVEX_URL

if CONVEX_URL:
    convex_client = ConvexClient(CONVEX_URL)
else:
    convex_client = None
