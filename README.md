# tie-api-example-twilio-ivr
This node.js example connector allows you to make your Teneo bot available on Twilio IVR (Interactive Voice Response). The connector acts as middleware between Twilio IVR API and Teneo to establish a phone call with a Teneo bot. This guide will take you through the steps of setting a new Twilio phone number and deploying the connector to respond to events sent by Twilio.


## Prerequisites
### Https
Twilio API requires that the connector is available via https. Ngrok is recommended for this.

### Teneo Engine
Your bot needs to be published and you need to know the engine url.


## Setup instructions
### Download, install and start connector
1. Download or clone the connector source code:
    ```
    git clone https://github.com/artificialsolutions/tie-api-example-twilio-ivr.git
    ```
2. Install dependencies by running the following command in the folder where you stored the source:
    ```
    npm install
    ``` 
3. Start the connector with the following command (replacing the environment variable with the appropriate value):
    ```
    TENEO_ENGINE_URL=<your_engine_url> node server.js
    ```

### Make the connector available via https
When using ngrok, make the connector available via https:

1. Make sure your connector is available via https. When running locally you can for example use [ngrok](https://ngrok.com) for this. Run the connector on port 1337 by default.
    ```
    ngrok http 1337
    ```
2. Running the command above will display a public https URL, copy it, we will use it as a `Webhook URL` for the following steps.


### Setup a Twilio phone number
1. Setup a free [Twilio](https://www.twilio.com/try-twilio) account, which comes with free credit money you can spend on buying a number.
2. Go to the left pane menu and click the **Programmable Voice** phone icon, then from the submenu choose **Numbers** and click the **Get a number** button.
3. Follow the instruction to obtain your phone number (the instruction may differ per region).
6. Click on "Manage Numbers".
7. Click your number so you can configure it.
8. Under "Voice & Fax" -> "A call comes in" set the webhook to your `Webhook URL` you copied earlier.


That's it! Call your Twilio number with your phone, and speak to your bot!


## Running the connector on Heroku

Click the button below to deploy the connector to Heroku:

[![Deploy](https://www.herokucdn.com/deploy/button.svg?classes=noborder)](https://heroku.com/deploy?template=https://github.com/artificialsolutions/tie-api-example-twilio-ivr)

In the 'Config Vars' section, add the following:
* **TENEO_ENGINE_URL:** The engine url


Next, follow the Twilio Setup instructions above. Make sure that in the step 8 you set the Webhook URL to the url of the Heroku app.
