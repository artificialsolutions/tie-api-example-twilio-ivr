/**
 * Copyright 2019 Artificial Solutions. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const http = require('http');
const express = require('express');
const qs = require('querystring');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const TIE = require('@artificialsolutions/tie-api-client');
const dotenv = require('dotenv');
dotenv.config();
const {
  TENEO_ENGINE_URL,
  LANGUAGE_STT,
  LANGUAGE_TTS,
  PORT
} = process.env;
const port = PORT || 1337;
const teneoApi = TIE.init(TENEO_ENGINE_URL);
let language_STT = LANGUAGE_STT || 'en-US'; // See: https://www.twilio.com/docs/voice/twiml/gather#languagetags
let language_TTS = LANGUAGE_TTS || 'Polly.Joanna'; // See: https://www.twilio.com/docs/voice/twiml/say/text-speech#amazon-polly

console.log("LANGUAGE_STT: " + LANGUAGE_STT)
console.log("LANGUAGE_TTS: " + LANGUAGE_TTS)

// initialise session handler, to store mapping between twillio CallSid and engine session id
const sessionHandler = SessionHandler();

// initialize an Express application
const app = express();
const router = express.Router()

// Tell express to use this router with /api before.
app.use("/", router);

// twilio message comes in
router.post("/", handleTwilioMessages(sessionHandler));

// handle incoming twilio message
function handleTwilioMessages(sessionHandler) {
  return (req, res) => {

    let body = '';
    req.on('data', function (data) {
      body += data;
    });

    req.on('end', async function () {

      // parse the body
      const post = qs.parse(body);

      // get the caller id
      const callSid = post.CallSid;
      console.log(`CallSid: ${callSid}`);

      // check if we have stored an engine sessionid for this caller
      const teneoSessionId = sessionHandler.getSession(callSid);
	  
      // check for Digits field
      let digitsCaptured = '';
      try {
        digitsCaptured = String(post.Digits);
      } catch (error) {
        // no need to do anything, but you could do this:
        console.error(error);
        console.log('No digits captured');
      }

      let callerCountry = '';
      if (post.CallerCountry) {
        callerCountry = post.CallerCountry;
      }

      // get transcipt of user's spoken response
      let userInput = '';
      let confidence = '';
      if (post.CallStatus = 'in-progress' && post.SpeechResult) {
        userInput = post.SpeechResult;
        if (post.Confidence) {
          confidence = post.Confidence;
        }
      }
      console.log(`userInput: ${userInput}`);
      console.log(`confidence: ${confidence}`);
      console.log(`callerCountry: ${callerCountry}`);

      // send input to engine using stored sessionid and retreive response
      const teneoResponse = await teneoApi.sendInput(teneoSessionId, { 'text': userInput, 'channel': 'twilio', 'digits': digitsCaptured, 'twilioConfidence' : confidence, 'twilioCallerCountry' : callerCountry});
      console.log(`teneoResponse: ${teneoResponse.output.text}`)

      // store engine sessionid for this caller
      sessionHandler.setSession(callSid, teneoResponse.sessionId);

      // prepare message to return to twilio
      sendTwilioMessage(teneoResponse, res);
    });
  }
}


function sendTwilioMessage(teneoResponse, res) {

  const twiml = new VoiceResponse();
  let response = null;


  // If the output parameter 'twilio_customVocabulary' exists, it will be used for custom vocabulary understanding.
  // This should be a string separated list of words to recognize
  var customVocabulary = '';
  if (teneoResponse.output.parameters.twilio_customVocabulary) {
    customVocabulary = teneoResponse.output.parameters.twilio_customVocabulary;
    console.log(`customVocabulary: ${customVocabulary}`);
  }

  // If the output parameter 'twilio_customTimeout' exists, it will be used to set a custom speech timeout.
  // Otherwise end of speech detection will be set to automatic
  var customTimeout = 'auto';
  if (teneoResponse.output.parameters.twilio_customTimeout) {
    customTimeout = teneoResponse.output.parameters.twilio_customTimeout;
  }
  
  // If the output parameter 'twilio_speechModel' exists, it will be used to set a custom speech model. Allowed values are: 'default', 'numbers_and_commands' and 'phone_call'.
  var customSpeechModel = 'default';
  if (teneoResponse.output.parameters.twilio_speechModel) {
    customSpeechModel = teneoResponse.output.parameters.twilio_speechModel;
  }  

  // If the output parameter 'twilio_inputType' exists, it will be used to set a custom input type. Allowed values are: 'dtmf', 'speech' or 'dtmf speech'  
  var customInputType = 'speech';
  if (teneoResponse.output.parameters.twilio_inputType) {
    customInputType = teneoResponse.output.parameters.twilio_inputType;
  }  

  if(teneoResponse.output.parameters.twilio_sttLanguage) {
    language_STT = teneoResponse.output.parameters.twilio_sttLanguage;
    console.log("langauge_STT: " + language_STT);
  }

  // If the output parameter 'twilio_endCall' exists, the call will be ended
  if (teneoResponse.output.parameters.twilio_endCall == 'true') {

    twiml.say({
      voice: language_TTS
    },teneoResponse.output.text);

    response = twiml.hangup();

  } else {
    response = twiml.gather({
      language: language_STT,
      hints: customVocabulary,
      input: customInputType,
      speechTimeout: customTimeout,
      speechModel: customSpeechModel,
      actionOnEmptyResult : 'true'
    });

    response.say({
      voice: language_TTS
    }, teneoResponse.output.text);
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
}


/***
 * SESSION HANDLER
 ***/
function SessionHandler() {

  // Map the Twilio CallSid id to the teneo engine session id. 
  // This code keeps the map in memory, which is ok for testing purposes
  // For production usage it is advised to make use of more resilient storage mechanisms like redis
  const sessionMap = new Map();

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
  console.log(`Listening on port: ${port}`);
});