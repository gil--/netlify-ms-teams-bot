const crypto = require('crypto');
require('dotenv').config();

const {
    MSFT_BOT_SHARED_SECRET,
} = process.env;

const bufSecret = Buffer(MSFT_BOT_SHARED_SECRET, "base64");

exports.handler = function (event, context, callback) {
    try {
        // Retrieve authorization HMAC information
        const auth = event.headers.authorization;

        if (!auth) {
            callback(null, {
                statusCode: 400,
                body: {
                    "type": "message", 
                    "text": "Error, no authorization header"
                }
            });
        }

        const payload = event.body

        // Calculate HMAC on the message we've received using the shared secret			
        const msgBuf = Buffer.from(payload, 'utf8');
        const msgHash = "HMAC " + crypto.createHmac('sha256', bufSecret).update(msgBuf).digest("base64");
        const payloadObj = JSON.parse(payload)
        const firstName = payloadObj.from.name.split(' ')[0];
        const message = payloadObj.text.replace('<at>SDBot</at>', '').trim();
        let responseMsg;

        console.log('==============');
        console.log('auth header: ', auth);
        console.log(payloadObj.from.name);
        console.log(payloadObj.text);
        console.log('==============');

        if (msgHash === auth) {
            if (message.includes('dog')) {
                responseMsg = `{ "type": "message", "text": "<img alt='Our CEO' src='https://images.dog.ceo/breeds/eskimo/n02109961_5797.jpg' />" }`;
            } else {
                responseMsg = `{ "type": "message", "text": "Hi ${firstName}! I hope you have a nice day!" }`;
            }
        } else {
            responseMsg = '{ "type": "message", "text": "Error: message sender cannot be authenticated." }';
        }

        callback(null, {
            statusCode: 200,
            body: responseMsg
        });
    }
    catch (err) {
        console.log(err);
        callback(null, {
            statusCode: 400,
            body: {
                "type": "message",
                "text": "Error: " + err + "\n" + err.stack
            }
        });
    }
};
