# tie-api-example-twilio-ivr
This example connector allows you to establish a phone call with a Teneo bot. The connector makes your Teneo bot available via Twilio IVR (Interactive Voice Response). This guide will take you through the steps of setting a new Twilio phone number and deploying the connector to respond to events sent by Twilio.


## Prerequisites
### Https
When running the connector locally, making the connector available via https is preferred. Ngrok is recommended for this.

### Teneo Engine
Your bot needs to be published and you need to know the engine url.

## Setup instructions
Below you will find two ways to run the this connector. The first way is by [running the connector on Heroku](#running-the-connector-locally). This is the easiest to get the connector running for non-developers since it does not require you to run node.js or download or modify any code.

The second way is to [run the connector locally](#running-the-connector-locally) or to deploy it on a server of your choice. This preferred if you're familiar with node.js development and want to have a closer look at the code and plan to enhance or modify it.

### Running the connector on Heroku
Click the button below to deploy the connector to Heroku:

[![Deploy](https://www.herokucdn.com/deploy/button.svg?classes=heroku)](https://heroku.com/deploy?template=https://github.com/artificialsolutions/tie-api-example-twilio-ivr)

In the 'Config Vars' section, add the following:
* **TENEO_ENGINE_URL:** The engine url of your bot

Optionally, you can also add the following parameters:
* **LANGUAGE_STT:** Speech to Text language. Defaults to en-US if not provided. For a list of supported languages, see: [https://www.twilio.com/docs/voice/twiml/gather#languagetags](https://www.twilio.com/docs/voice/twiml/gather#languagetags). Note that your Teneo solution should match the chosen language as well.
* **LANGUAGE_TTS:** Text to Speech language. Defaults to en-US if not provided. For a list of supported languages, see: [https://www.twilio.com/docs/voice/twiml/say/text-speech#amazon-polly](https://www.twilio.com/docs/voice/twiml/say/text-speech#amazon-polly). Note that your Teneo solution should match the chosen language as well.

Next, follow the [Setup a Twilio phone number](#setup-a-twilio-phone-number) instructions. Make sure that in step 6 you set the <mark>Webhook</mark> to the url of the Heroku app.

### Running the connector locally
If you want to run the connector locally, follow the steps below. If you have already followed the instructions above to deploy the connector on Heroku, you can skip this section and jump straight to [Setup a Twilio phone number](#setup-a-twilio-phone-number).
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
    Optionally you can add the environment variables <mark>LANGUAGE_STT</mark> and <mark>LANGUAGE_TTS</mark> to set the Speech to Text and Text to Speech language. The code defaults to 'en-US' for both.

Next, we need to make the connector available via https. We'll use [ngrok](https://ngrok.com) for this.

1. Start ngrok. The connector runs on port 1337 by default, so we need to start ngrok like this:
    ```
    ngrok http 1337
    ```
2. Running the command above will display a public https URL. Copy it, we will use it as a <mark>Webhook URL</mark> in step 6 of the Twilio Setup instructions below.

### Setup a Twilio phone number
1. Setup a free [Twilio](https://www.twilio.com/try-twilio) account, which comes with free credit money you can spend on buying a number.
2. Go to the left pane menu and click the **Programmable Voice** phone icon, then from the submenu choose **Numbers** and click the **Get a number** button.
3. Follow the instruction to obtain your phone number (the instruction may differ per region).
4. Click on "Manage Numbers".
5. Click your number so you can configure it.
6. Under "Voice & Fax" -> "A call comes in" set the webhook to your <mark>Webhook URL</mark> you copied earlier.


That's it! Call your Twilio number with your phone, and speak to your bot!

## Engine output parameters
The connector will check for the following output parameters in an output to send specific data to Twillo:

### twilio_customVocabulary
If the output parameter `twilio_customVocabulary` exists, it will be used for custom vocabulary understanding or hints. The value should be a string. You may provide up to 500 words or phrases, separating each entry with a comma. Your hints may be up to 100 characters each, and you should separate each word in a phrase with a space. For more details: [https://www.twilio.com/docs/voice/twiml/gather#hints](https://www.twilio.com/docs/voice/twiml/gather#hints)

### twilio_endCall
If the output parameter `twilio_endCall` exists, the call will be ended.