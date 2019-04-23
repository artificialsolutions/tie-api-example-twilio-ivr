# tie-api-example-twilio-ivr
This node.js example connector allows you to make your Teneo bot available on Twilio IVR (Interactive Voice Response). The connector acts as middleware between Twilio and Teneo and an IVR API to establish a phone call with a Teneo bot. This guide will take you through the steps of setting a new Twilio phone number and deploying the connector to respond to events sent by Twilio.


## Prerequisites
### Https
Twilio API requires that the connector is available via https. Ngrok is recommended for this.

1. Make sure your connector is available via https. When running locally you can for example use ngrok for this: [ngrok.com](https://ngrok.com). The connector runs on port 1337 by default.
    ```
    ngrok http 1337
    ```
2. Running the command above will display a public Https URL, copy it, and use it as a Webhook URL for the following steps.


## Running the connector locally
### Twilio Setup

1. Setup a free Twilio account ([Try-Twilio](https://www.twilio.com/try-twilio)), which comes with free credit money you can spend on buying a number.
2. Go to the left pane menu and click the "Programmable Voice" phone icon, then click "Buy a number".
3. On the popup window, select the "Voice" checkbox and click "Search'.
4. Buy a local number of your choosing. The free credit will pay for it.
5. Click on submenu "Numbers"
6. Click on "Manage Numbers"
7. Click your number to configure
8. Under "Voice & Fax" -> "A call comes in" set the webhook to `https://<your ngrok public URL>`


### Connector Setup Instructions

1. Download or clone the connector source code from [Github](https://github.com/artificialsolutions/tie-api-example-twilio-ivr).
2. Install dependencies by running `npm install` in the folder where you stored the source.
3. Start the connector with the following command (replacing the environment variables with the appropriate values):
    ```
    WEBHOOK_FOR_TWILIO=<a_public_webhook_URL> TENEO_ENGINE_URL=<your_engine_url> node server.js
    ```

Call the Twilio number with your phone, and speak to your bot.