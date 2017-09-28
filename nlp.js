/**
 * Created by Ridho on 9/28/2017.
 */

module.exports = {
    foo: function (res) {
        // whatever
        console.log("From nlp");
        res.send(halo());
    },
    handleMessage: function (event, message) {
        handleMessage(event, message)
    }
};


var request = require('request');

function halo() {
    return "halo polisi";
}


function firstEntity(nlp, name) {
    console.log('nlp', nlp);
    console.log('nlp.entities', nlp.entities);
    console.log('nlp.entities[' + name + ']', nlp.entities[name]);
    //console.log('nlp.entities[' + name + '][0]', JSON.parse(nlp.entities).name[0]);
    // && nlp.entities.get(name)[0]
    return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
}

function handleMessage(event, message) {
    // check greeting is here and is confident
    const greeting = firstEntity(message.nlp, 'greetings');
    if (greeting && greeting.confidence > 0.8) {
        //getToken("Hi, im testing", event.recipient.id, event.sender.id, false);
        getChatBot(message.text, event.recipient.id, event.sender.id);
        // sendMessage(event.recipient.id, reply, token);
    } else {
        // default logic
    }
}


// {"sender":{"id":"877390472364218"},"recipient":{"id":"228431964255924"},"timestamp":1506613480324,"message":{"mid":"mid.$cAADPwbeT
//     p-xk-m6ThFeySlGmsmqQ","seq":23478,"text":"Hi","nlp":{"entities":{"intent":[{"confidence":1,"value":"Good morning","type":"value"}],"greetings":[{"confidence":0.99994528293428,"value":"t
//     rue"}]}}}}


function getChatBot(key, sender, recipient) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/read?token=1234567890&api_name=CHATBOT&key=' + key
        + '&page_id=' + sender;
    console.log('url', url);
    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                var obj = JSON.parse(body);
                console.log('json: ', obj);
                if (obj[0].json[0].message) {
                    var message = obj[0].json[0].message.text;
                    getToken(message, sender, recipient, false);
                }
            }
        }
    );
}

function getToken(m_payload, sender, recipient, isMessageUs) {
    var url = 'http://halfcup.com/social_rebates_system/api/getPageMessengerToken?messenger_id=' + sender + '&messenger_uid=' + recipient;
    console.log('url', url);
    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                var obj = JSON.parse(body);
                console.log('json: ', obj);
                var code = obj.code;
                if (code == 1) {
                    var token = obj.messenger_data.pageAccessToken;
                    var message = {"text": m_payload};
                    if (isMessageUs)
                        message = {
                            "text": m_payload
                        };

                    var js_ = JSON.stringify(message);
                    var myEscapedJSONString = js_.escapeSpecialChars();
                    myEscapedJSONString = myEscapedJSONString.replace(/\\\\n/g, "\\n");
                    console.log("TEXT ==> " + myEscapedJSONString);
                    sendMessage(recipient, myEscapedJSONString, token);
                }
                if (code == 0) {
                    console.log('NLP : Can\'t send message, TOKEN NOT FOUND, Get page access token from facebook developer page and register to http://halfcup.com/social_rebates_system');
                }
            }
        }
    );
}
// generic function sending messages
function sendMessage(recipientId, message, token) {
    //console.log(process); process.env.PAGE_ACCESS_TOKEN

    var result = "";
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: token},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
            result = 'Error sending message: ' + error;
            return result;
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
            result = 'Error: ' + response.body.error;
            return result;
        } else {
            // console.log('============ ' + response + ' =========== ');
            result = JSON.stringify(response);
            return result;
        }
    });
};


//