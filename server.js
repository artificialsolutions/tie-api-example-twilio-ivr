const http = require('http');
const express = require('express');
const qs = require('querystring');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const TIE = require('@artificialsolutions/tie-api-client');
const {
  TENEO_ENGINE_URL,
  WEBHOOK_FOR_TWILIO,
  FIRST_INPUT_FOR_TENEO,
  LANGUAGE_STT,
  LANGUAGE_TTS,
  PORT
} = process.env;
const port = PORT || 1337;
const teneoApi = TIE.init(TENEO_ENGINE_URL);
const firstInput = FIRST_INPUT_FOR_TENEO || '';
const language_STT = LANGUAGE_STT || 'en-GB';
const language_TTS = LANGUAGE_TTS || 'en-GB';


// initialise session handler, to store mapping between slack 'channel' and engine session
const sessionHandler = SessionHandler();

function createTwilioMessage(phoneNumber, textToSend) {
  const message = {};
  message.text = textToSend;
  message.channel = 'twilio'
  message.phoneNumber = phoneNumber;
  return message;
}


// initialize an Express application
const app = express();
var router = express.Router()

// Tell express to use this router with /api before.
app.use("/", router);

router.post("/", handleTwilioMessages(sessionHandler));


function handleTwilioMessages(sessionHandler) {
  return (req, res) => {

    var body = '';
    req.on('data', function (data) {
      body += data;
    });

    req.on('end', async function () {

      var post = qs.parse(body);
      var callId = post.CallSid;
      var phoneNumber = post.Caller;
      var textToSend = '';

      if (post.CallStatus == 'ringing') { // If first input of call, send default input to Teneo (blank here)
        textToSend = firstInput;
      } else if (post.CallStatus = 'in-progress' && post.SpeechResult) { // Spoken responses
        textToSend = post.SpeechResult;
      } else { // Unrecognized, send blank
        textToSend = '';
      }

      const teneoSessionId = sessionHandler.getSession(callId);
      const teneoResponse = await teneoApi.sendInput(teneoSessionId, createTwilioMessage(phoneNumber, textToSend));

      sessionHandler.setSession(callId, teneoResponse.sessionId);

      console.log('Caller ID: ' + callId);
      if (textToSend) {
        console.log('Captured Input: ' + textToSend);
      }
      if (teneoResponse.output.text) {
        console.log('Spoken Output: ' + teneoResponse.output.text);
      }

      sendTwilioMessage(teneoResponse, res);
    });
  }
}


function sendTwilioMessage(teneoResponse, res) {

  const twiml = new VoiceResponse();
  var response = null;

  var customVocabulary = ''; // If the output parameter 'twilio_customVocabulary' exists, it will be used for custom vocabulary understanding.  This should be a string separated list of words to recognize
  if (teneoResponse.output.parameters.twilio_customVocabulary) {
    customVocabulary = teneoResponse.output.parameters.twilio_customVocabulary;
  }

  if (teneoResponse.output.parameters.twilio_endCall == 'true') { // If the output parameter 'twilio_endcall' exists, the call will be ended
    response = twiml.hangup();
  } else {
    console.log("Custom vocab: " + teneoResponse.output.parameters.twilio_customVocabulary);
    response = twiml.gather({
      language: language_STT,
      hints: customVocabulary,
      action: WEBHOOK_FOR_TWILIO,
      input: 'speech',
      speechTimeout: 1
    });
    /*
    response.say({
        voice: 'woman',
        language: language_TTS
    }, teneoResponse.output.text);
    */
    response.say(teneoResponse.output.text);
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
}


/***
 * SESSION HANDLER
 ***/

function SessionHandler() {

  var sessionMap = new Map();

  return {
    getSession: (userId) => {
      if (sessionMap.size > 0) {
        return sessionMap.get(userId);
      }
      else {
        return "";
      }
    },
    setSession: (userId, sessionId) => {
      sessionMap.set(userId, sessionId)
    }
  };
}

// start the express application
http.createServer(app).listen(port, () => {
  console.log('Twilio will send messages to this server on : ' + WEBHOOK_FOR_TWILIO + ':' + port);
});