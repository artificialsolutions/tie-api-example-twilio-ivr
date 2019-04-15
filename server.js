const http = require('http');
const chalk = require('chalk');
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

/***
 * VERY BASIC SESSION HANDLER
 ***/

function SessionHandler() {

  var sessionMap = new Map();
  
  return {
    getSession: (userId) =>  new Promise((resolve, reject) => {	
		if(sessionMap.size>0){
			resolve(sessionMap.get(userId));
		}
		else{
			resolve("")
		}
	}),
    setSession: (userId, sessionId) => new Promise((resolve, reject) =>{
			sessionMap.set(userId,sessionId);
		resolve();
	})
  };
}

/***
 * LISTEN FOR INPUTS FROM TWILIO, SEND TO TENEO AND RESPOND
 ***/

var server = http.createServer((req, res) => {
	var sessionHandler = SessionHandler();
	var body = '';
	req.on('data', function (data) {
		body += data;
	});

	req.on('end', function () {
	
		var post = qs.parse(body);
		var textToSend = '';

		if (post.CallStatus == 'ringing') { // If first input of call, send default input to Teneo (blank here)
			textToSend = firstInput;
		} else if (post.CallStatus = 'in-progress' && post.SpeechResult) { // Spoken responses
			textToSend = post.SpeechResult;
		} else { // Unrecognized, send blank
			textToSend = '';
		}

		var callId = post.CallSid;
		var phoneNumber = post.Caller;
		var teneoSessionId = sessionHandler.getSession(callId);

		console.log("get teneoSessionId: "); console.log(teneoSessionId);

		teneoApi.sendInput(teneoSessionId, {text: textToSend, channel: 'twilio', phoneNumber: phoneNumber}).then(teneoResponse => {

			sessionHandler.setSession(callId, teneoResponse.sessionId);

			const twiml = new VoiceResponse();
			var response = null;

			var customVocabulary = ''; // If the output parameter 'twilio_customVocabulary' exists, it will be used for custom vocabulary understanding.  This should be a string separated list of words to recognize
			if (teneoResponse.output.parameters.twilio_customVocabulary) {
				customVocabulary = teneoResponse.output.parameters.twilio_customVocabulary;
			}

			if  (teneoResponse.output.parameters.twilio_endCall == 'true') { // If the output parameter 'twilio_endcall' exists, the call will be ended
				response = twiml.hangup();
			} else {
				console.log("Custom vocab: "+teneoResponse.output.parameters.twilio_customVocabulary);
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

			console.log(chalk.yellow('Caller ID: '+callId));
			if (textToSend)
				console.log(chalk.green('Captured Input: '+textToSend));
			if (teneoResponse.output.text)
				console.log(chalk.blue('Spoken Output: '+teneoResponse.output.text));

			res.writeHead(200, { 'Content-Type': 'text/xml' });
			res.end(twiml.toString());

		});

	});

}).listen(port);

console.log(chalk.bold('Twilio will send messages to this server on: '+WEBHOOK_FOR_TWILIO+':'+port));