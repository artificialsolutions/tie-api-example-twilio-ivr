# tie-api-example-twilio-ivr
This example connector allows you to establish a phone call with a Teneo bot. The connector makes your Teneo bot available via Twilio IVR (Interactive Voice Response). This guide will take you through the steps of setting a new Twilio phone number and deploying the connector to respond to events sent by Twilio.

## Prerequisites
### Https
When running the connector locally, making the connector available via https is preferred. Ngrok is recommended for this.

### Teneo Engine
Your bot needs to be published and you need to know the engine url.

## Setup instructions
Below you will find two ways to run the this connector. The first way is by [running the connector on Heroku](#running-the-connector-on-heroku). This is the easiest to get the connector running for non-developers since it does not require you to run node.js or download or modify any code.

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
3. Create a `.env` file in the folder where you stored the source and add the URL of your engine. Optionally you can also specify the langauges for Speech To Text and Text To Speech:
    ```
    TENEO_ENGINE_URL=<your_engine_url>
    LANGUAGE_STT=en-US
    LANGUAGE_TTS=Polly.Joanna
    ```
4. Start the connector:
    ```
    node server.js
    ```

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
6. Under "Voice & Fax" -> "A call comes in" set the webhook to the <mark>Webhook URL</mark> you copied earlier.


That's it! Call your Twilio number with your phone, and speak to your bot!

## Engine input parameters
The connector will send the following input parameters along with the user input to the Teneo engine:

### channel
The input parameter `channel` with value `twilio` is included in each request. This allows you to add channel specfic optimisations to your bot.

### digits
In case the user switched to `dtmf` input, the digits entered are provided in the input parameter `digits`.

### twilioConfidence
The `twilioConfidence` input parameter contains the confidence score of the Speech To Text engine used by Twilio.

### twilioCallerCountry
The input parameter `twilioCallerCountry` contains the country code of the caller. You can use this to improve the Speech to Text model, for example by adding an output parameter `twilio_sttLanguage` with value `en-GB` to responses for callers calling from the UK.

## Engine output parameters
The connector will check for the following output parameters in an output to send specific data to Twillo:

### twilio_customVocabulary
If the output parameter `twilio_customVocabulary` exists, it will be used for custom vocabulary understanding or hints. The value should be a string. You may provide up to 500 words or phrases, separating each entry with a comma. Your hints may be up to 100 characters each, and you should separate each word in a phrase with a space. For more details: [https://www.twilio.com/docs/voice/twiml/gather#hints](https://www.twilio.com/docs/voice/twiml/gather#hints)

### twilio_customTimeout
By default, end of speech is detected automatically. The `twilio_customTimeout` output parameter allows you to set a custom timeout. This can come in handy when you ask the user for a number for example. In that case you may prefer a longer end of speech detection timeout.

### twilio_endCall
If the output parameter `twilio_endCall` with the value `true` exists, the call will be ended.

### twilio_speechModel
If the output parameter `twilio_speechModel` exists, it will be used to set a custom speech model. Allowed values are: 'default', 'numbers_and_commands' and 'phone_call'.

### twilio_sttLanguage
If provided, will override the environment variable `LANGUAGE_STT`.

### twilio_inputType
If the output parameter `twilio_inputType` exists, it will be used to set a custom input type. Allowed values are: 'dtmf', 'speech' or 'dtmf speech'. DTMF allows the end user to enter a number using the keypad of the phone. User must press # to mark end of the input. The digits entered by the user will be sent to engine using an input parameter `digits`.