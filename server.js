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
const {
  TENEO_ENGINE_URL,
  LANGUAGE_STT,
  LANGUAGE_TTS,
  PORT
} = process.env;
const port = PORT || 1337;
const teneoApi = TIE.init(TENEO_ENGINE_URL);
const language_STT = LANGUAGE_STT || 'en-US';
const language_TTS = LANGUAGE_TTS || 'en-US';

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

      // get transcipt of user's spoken response
      let userInput = '';
      if (post.CallStatus = 'in-progress' && post.SpeechResult) {
        userInput = post.SpeechResult;
      }
      console.log(`userInput: ${userInput}`);

      // send input to engine using stored sessionid and retreive response
      const teneoResponse = await teneoApi.sendInput(teneoSessionId, { 'text': userInput, 'channel': 'twilio' });
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

  // If the output parameter 'twilio_endCall' exists, the call will be ended
  if (teneoResponse.output.parameters.twilio_endCall == 'true') {
    response = twiml.hangup();
  } else {
    response = twiml.gather({
      language: language_STT,
      hints: customVocabulary,
      input: 'speech',
      speechTimeout: 'auto'
    });

    response.say({
      language: language_TTS,
      voice: 'woman'
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