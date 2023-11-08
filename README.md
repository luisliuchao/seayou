# SeaYou - My SeaTalk Bot Friend

This is a tutorial to create and deploy your SeaTalk bot with one click.

## Steps

1. create a SeaTalk bot at https://open.seatalk.io

2. click [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fluisliuchao%2Fseayou&env=SEA_APP_ID,SEA_APP_SECRET,BOT_SIGNING_SECRET) to deploy the bot on vercel

3. update the environment variables where

   1. `SEA_APP_ID` is the `APP ID` in Basic Info & Credentials page
   2. `SEA_APP_SECRET` is the `APP SECRET` in Basic Info & Credentials page
   3. `BOT_SIGNING_SECRET` is the `Signing Secret` in Event Callback page

4. go to the vercel domain and paste the vercel domain in SeaTalk bot's Event Callback page e.g. `https://seayou.vercel.app`

5. (optional) To recreate SeaTalk i.e. record all messages received, add extra two environment variables from https://www.convex.dev/ and redeploy in vercel

   1. `CONVEX_URL`
   2. `CONVEX_DEPLOY_KEY`

## Local Development

1. create `.env` file and copy from `.env.example` and update the environment variables
2. install packages with `pip install -r requirements.txt`
3. start the flask server with `python app.py`
4. setup ngrok for port 5001 with `ngrok http 5001`
5. add the ngrok url back to Event Callback page e.g.`https://9fdf-101-127-248-164.ngrok-free.app`
6. to update the frontend, you need to setup a convex account

```
   cd frontend;
   npm install;
   npm run dev;
```
