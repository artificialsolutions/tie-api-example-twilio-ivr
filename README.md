# tie-api-example-twilio-ivr
This node.js example connector allows you to make your Teneo bot available on Twilio IVR (Interactive Voice Response). The connector acts as middleware between Twilio and Teneo and an IVR API to establish a phone call with a Teneo bot. This guide will take you through the steps of setting a new Twilio phone number and deploying the connector to respond to events sent by Twilio.


## Prerequisites
### Https
Twilio API requires that the connector is available via https. Ngrok is recommended for this.

1. Make sure your connector is available via https. When running locally you can for example use [ngrok](https://ngrok.com) for this. Run the connector on port 1337 by default.
    ```
    ngrok http 1337
    ```
2. Running the command above will display a public https URL, copy it, we will use it as a `Webhook URL` for the following steps.


## Running the connector locally
### Twilio Setup

1. Setup a free [Twilio](https://www.twilio.com/try-twilio) account, which comes with free credit money you can spend on buying a number.
2. Go to the left pane menu and click the "Programmable Voice" phone icon, then click "Buy a number".
3. On the popup window, select the "Voice" checkbox and click "Search'.
4. Buy a local number of your choosing. The free credit will pay for it.
5. Click on submenu "Numbers"
6. Click on "Manage Numbers"
7. Click your number to configure
8. Under "Voice & Fax" -> "A call comes in" set the webhook to your `Webhook URL` you copied earlier


### Connector Setup Instructions

1. Download or clone the connector source code:
    ```
    git clone https://github.com/artificialsolutions/tie-api-example-twilio-ivr.git
    ```
2. Install dependencies by running the following command in the folder where you stored the source:
    ```
    npm install
    ``` 
3. Start the connector with the following command (replacing the environment variables with the appropriate values):
    ```
    WEBHOOK_FOR_TWILIO=<a_public_webhook_URL> TENEO_ENGINE_URL=<your_engine_url> node server.js
    ```

Call the Twilio number with your phone, and speak to your bot!


## Running the connector on Heroku

Click the button below to deploy the connector to Heroku:

[![Deploy](https://www.herokucdn.com/deploy/button.svg?classes=noborder)](https://heroku.com/deploy?template=https://github.com/artificialsolutions/tie-api-example-twilio-ivr)

In the 'Config Vars' section, add the following:
* **WEBHOOK_FOR_TWILIO:** The url of this heroku app - `https:/[your heroku app name].herokuapp.com`
* **TENEO_ENGINE_URL:** The engine url


Next, follow the Twilio Setup instructions above. Make sure that in the step 8 you set the Webhook URL to the url of the Heroku app.
