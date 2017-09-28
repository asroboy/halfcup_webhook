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
    // return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
    return nlp && nlp.entities;
}

function isGroup(jsonMessage, index) {
    var json = JSON.parse(jsonMessage[0].json);
    return json[index] && json[index].group;
}

function isChatBot(jsonMessage, index) {
    var json = JSON.parse(jsonMessage[0].json);
    return json[index] && json[index].message;
}


function handleMessage(event, message) {
    // check greeting is here and is confident
    const greeting = firstEntity(message.nlp, 'greetings');
    // if (greeting && greeting.confidence > 0.8) {
    if (greeting) {
        //getToken("Hi, im testing", event.recipient.id, event.sender.id, false);
        getChatBot(message.text, event.recipient.id, event.sender.id);
        // sendMessage(event.recipient.id, reply, token);
    } else {
        //getDefaultAnswer://halfcup.com/social_rebates_system/wapi/read?token=1234567890&api_name=DEFAULT_ANSWER&page_id=228431964255924
        detDefaultAnswer(event.recipient.id, event.sender.id);
        // default logic
    }
}

function getDefaultAnswer(sender, recipient) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/read?token=1234567890&api_name=DEFAULT_ANSWER&page_id=' + sender + '&is_on=true';
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
                if (obj.length > 0) {
                    var jsonMessage = JSON.parse(obj[0].json);
                    var randomIndex = randomIntFromInterval(1, jsonMessage.length);
                    console.log("randomIndex : " + randomIndex);
                    console.log("jsonMessage.length : " + jsonMessage.length);
                    respond(obj, sender, recipient, randomIndex);
                }
            }
        }
    );
}


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
                if (obj.length > 0) {
                    var jsonMessage = JSON.parse(obj[0].json);
                    var randomIndex = randomIntFromInterval(1, jsonMessage.length);
                    console.log("randomIndex : " + randomIndex);
                    console.log("jsonMessage.length : " + jsonMessage.length);
                    respond(obj, sender, recipient, randomIndex);
                } else {
                    getDefaultAnswer(sender, recipient);
                }

            }
        }
    );
}


function getGroupBot(key, sender, recipient) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/read?token=1234567890&api_name=GROUP&key=' + key;
    // + '&page_id=' + sender;
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
                var jsonMessage = JSON.parse(obj[0].json);
                var randomIndex = randomIntFromInterval(1, jsonMessage.length);
                console.log("randomIndex : " + randomIndex);
                console.log("jsonMessage.length : " + jsonMessage.length);
                respond(obj, sender, recipient, randomIndex);
            }
        }
    );
}


function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function respond(jsonMessage, sender, recipient, index) {
    index = index - 1;
    console.log('json: ', jsonMessage);
    if (isGroup(jsonMessage, index)) {
        var json = JSON.parse(jsonMessage[0].json);
        var key = json[0].group.key;
        getGroupBot(key, sender, recipient, false);
    } else if (isChatBot(jsonMessage, index)) {
        var json = JSON.parse(jsonMessage[0].json);
        var message = json[index].message.text;
        getToken(message, sender, recipient, false);
    } else {
        // getDefaultAnswer(sender, recipient);
    }
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

                    if (m_payload.indexOf('{{') > -1) {
                        getUserInfo(m_payload,recipient, token);
                    }else{
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


function getUserInfo(m_payload, messengerId, token) {
    var url = "https://graph.facebook.com/v2.6/" + messengerId + "?access_token=" + token;
    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                console.log('FB PROFILE', body);

                var firstName = body.first_name;
                m_payload = m_payload.replace("{{first_name}}", firstName);
                var message = {"text": m_payload};
                var js_ = JSON.stringify(message);
                var myEscapedJSONString = js_.escapeSpecialChars();
                myEscapedJSONString = myEscapedJSONString.replace(/\\\\n/g, "\\n");
                console.log("TEXT ==> " + myEscapedJSONString);
                sendMessage(messengerId, myEscapedJSONString, token);
            }
        }
    );
}

//