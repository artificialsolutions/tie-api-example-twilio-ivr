# tie-api-example-twilio-ivr

This is a node application that allows you to use Twilio Voice (IVR) to connect to a Teneo Bot.  Also includes an app.json to allow one-click deployment to Heroku (free dyno).

Twilio Setup

1. Setup a free Twilio account and phone number
2. Go to "All Products and Service" and click "Programmable Voice"
3. Click on submenu "Numbers"
4. Click on "Manage Numbers"
5. Click your number to configure
6. Under "Voice & Fax" -> "A call comes in" set the webhook to https://<your heroku app name>.herokuapp.com

Heroku Setup (assuming you already have a free account) 

1. Go to this link:

https://heroku.com/deploy?template=https://github.com/pomegran/twilio-voice-teneo/

2. Ensure your app name is the same as that entered in step 6 above
3. Enter config var "TENEO_ENGINE_URL" e.g. https://teneo5-demos.presales.artificial-solutions.com/mydemokb
4. Enter config var "WEBHOOK_FOR_TWILIO" i.e. https://<your heroku app name>.herokuapp.com
5. Click "Deploy App"

You should now be able to call the number and speak to your bot.