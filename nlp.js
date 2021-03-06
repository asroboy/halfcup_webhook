/**
 * Created by Ridho on 9/28/2017.
 */

module.exports = {
    foo: function (res) {
        // whatever
        console.log("From nlp");
        // test();
        res.send("OK");
        // getAiToken();
    },
    handleMessage: function (event, message) {
        handleMessage(event, message);
    },
    getChatBot: function (key, sender, recipient) {
        getChatBot(key, sender, recipient);
    },
    getMerchantId: function (pageId, recipient, text) {
        if (text.indexOf('{{') > -1) {
            var key = text.replace("{{", "").replace("}}", "");
            getChatBot(key, pageId, recipient);
        } else {
            getMerchantId(pageId, recipient, text);
        }

    },
    /*,
     getAiKey: function (sender) {
     getAiKey(sender);
     }*/
};

var async = require("async");
var request = require('request');
// var sleep = require('sleep');

var q = async.queue(function (task, callback) {
    console.log('hello async task ' + task.i + " JSON " + task.json);
    // doSetTimeout(task.json, task.sender, task.recipient, task.i);
    respondToTextOrAttacment(task.json, task.sender, task.recipient, task.i);
    callback();
}, 1);


function halo() {
    return "halo polisi";
}

function firstEntity(nlp, name) {
    // console.log('nlp', nlp);
    // console.log('nlp.entities', nlp.entities);
    // console.log('nlp.entities[' + name + ']', nlp.entities[name]);
    //console.log('nlp.entities[' + name + '][0]', JSON.parse(nlp.entities).name[0]);
    // && nlp.entities.get(name)[0]
    return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
    // return nlp && nlp.entities;
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
    // const greetings = firstEntity(message.nlp, 'greetings');
    // const intent = firstEntity(message.nlp, 'intent');
    // const datetime = firstEntity(message.nlp, 'datetime');
    // // if (greeting && greeting.confidence > 0.8) {
    // if (greetings) {
    //     console.log('greetings ', greetings);
    //     // getToken("Hi, nice to see you", event.recipient.id, event.sender.id, false);
    //     getChatBot(message.text, event.recipient.id, event.sender.id);
    //     // sendMessage(event.recipient.id, reply, token);
    // } else if (intent && intent.confidence > 0.8) {
    //     console.log('intent ', intent);
    //     getToken(message.nlp.entities['intent'][0].value, event.recipient.id, event.sender.id, false)
    //
    // } else if (datetime && datetime.confidence > 0.8) {
    //     console.log('datetime ', datetime);
    //     var msg = 'Today is ' + message.nlp.entities['datetime'][0].value;
    //     getToken(msg, event.recipient.id, event.sender.id, false)
    // } else {
    //     //getDefaultAnswer://halfcup.com/social_rebates_system/wapi/read?token=1234567890&api_name=DEFAULT_ANSWER&page_id=228431964255924
    //     getDefaultAnswer(event.recipient.id, event.sender.id);
    //     // default logic
    //
    // }

    var pageId = event.recipient.id;
    var userId = event.sender.id;
    if (message.text.indexOf('{{') > -1) {
        var key = message.text.replace("{{", "").replace("}}", "");
        getChatBot(key, pageId, userId);
    } else {
        getMerchantId(pageId, userId, message.text);
    }

    // getMerchantId(pageId, userId, message.text);
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
//==============

function getMerchantId(pageId, recipient, text) {
    console.log("TEXT ========================================> " + text);
    var url = 'http://halfcup.com/social_rebates_system/wapi/read?api_name=GET_RESTAURANT&token=1234567890&page_id=' + pageId;
    console.log('url', url);
    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                console.log('Error : ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                var obj = JSON.parse(body);
                // console.log('obj: ', obj);
                if (obj.restaurant_id !== null)
                    getAiToken(pageId, recipient, obj.restaurant_id, text);
            }
        }
    );
}

function getAiToken(sender, recipient, restaurantId, text) {
    var url = 'http://aileadsbooster.com/backend/getEnvironment?page_id=' + sender + '&merchant_id=' + restaurantId + '&lang=en';
    console.log('url', url);
    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                console.log('Error : ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                var obj = JSON.parse(body);
                // console.log('obj: ', obj);
                if (obj.access_token !== '') {
                    var pageId = sender;
                    getAiKeyFromDB(obj.access_token, pageId, recipient, text);
                }

            }
        }
    );
}

function getAiKeyFromDB(token, pageId, recipient, text) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/read?api_name=AI_PREV_KEYS&token=1234567890&page_id=' + pageId;
    console.log('url', url);
    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                console.log('Error : ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                var obj = JSON.parse(body);
                // console.log('obj: ', obj);
                getAiKey(text, token, pageId, JSON.stringify(obj.keys), recipient);
            }
        }
    );
}

function getAiKey(text, token, pageId, prevKeys, recipient) {
    var url = 'http://aileadsbooster.com/backend/query?q=' + text + '&access_token=' + token + '&prev_key=' + prevKeys;
    // + prevKeys;
    console.log('url', url);
    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                console.log('Error : ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                var obj = JSON.parse(body);
                // console.log('obj: ', obj);
                saveAiKey(obj.key, pageId, recipient);
            }
        }
    );
}

function saveAiKey(key, pageId, recipient) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/save?api_name=AI_PREV_KEYS&key=' + key + '&token=1234567890&page_id=' + pageId;
    console.log('url', url);
    request({
            url: url,
            method: 'POST'
        }, function (error, response, body) {
            if (error) {
                console.log('Error : ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                var obj = JSON.parse(body);
                // console.log('obj: ', obj);
                // return obj.message
                getChatBot(key, pageId, recipient)
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
                respondFromGroup(obj, sender, recipient, jsonMessage.length);
            }
        }
    );
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function test() {
    for (i = 0; i < 3; i++) {
        doSetTimeout(i);
    }
}

function doSetTimeout(json, sender, recipient, i) {
    setTimeout(function () {
        respondToTextOrAttacment(json, sender, recipient, i);
    }, 200);
}


function respondFromGroup(jsonMessage, sender, recipient, size) {
    var json = JSON.parse(jsonMessage[0].json);

    // assign a callback
    q.drain = function () {
        console.log('all items have been processed');
    };


    for (i = 0; i < size; i++) {
        // var vars = [json, sender, recipient, i]
        if (isChatBot(jsonMessage, i)) {
            q.push({json: json, sender: sender, recipient: recipient, i: i}, function (err) {
                console.log('finished processing');
            });
            // doSetTimeout(json, sender, recipient, i);
            // setTimeout(Function('respondToTextOrAttacment(json, sender, recipient, i)'), 400);
        }

        // setTimeout( function (i, jsonMessage) {
        //     console.log('check at ' + i);
        //     if (isChatBot(jsonMessage, i)) {
        //         // respondToTextOrAttacment(json, sender, recipient, i);
        //         var index = i;
        //         console.log('delay at ' + i);
        //         respondToTextOrAttacment(json, sender, recipient, index);
        //     }
        // }, 400);

        // setTimeout(function () {
        //     console.log('delay 0,7 sec');
        // }, 700);
    }

}

function respondToTextOrAttacment(json, sender, recipient, index) {

    console.log(index);
    if (json[index].message.text) {
        var message = json[index].message.text;
        console.log(message);
        getToken(message, sender, recipient, false);
    } else {
        var message = json[index].message;
        console.log(message);
        getToken(message, sender, recipient, false);
    }
}

function respond(jsonMessage, sender, recipient, index) {
    index = index - 1;
    // console.log('json: ', jsonMessage);
    if (isGroup(jsonMessage, index)) {
        console.log('GROUP');
        var json = JSON.parse(jsonMessage[0].json);
        var key = json[index].group.key;
        console.log('key: ', key);
        getGroupBot(key, sender, recipient, false);
    } else if (isChatBot(jsonMessage, index)) {
        console.log('CHATBOT');
        var json = JSON.parse(jsonMessage[0].json);
        respondToTextOrAttacment(json, sender, recipient, index)
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

                var code = obj.code;
                if (code == 1) {
                    var token = obj.messenger_data.pageAccessToken;
                    // console.log('token: ', token);
                    if (m_payload.attachment) {
                        // var myEscapedJSONString = m_payload.escapeSpecialChars();
                        // myEscapedJSONString = myEscapedJSONString.replace(/\\\\n/g, "\\n");
                        // console.log("TEXT ==> " + myEscapedJSONString);
                        sendMessage(recipient, m_payload, token);
                    } else {
                        if (m_payload.indexOf('{{') > -1) {
                            getUserInfo(m_payload, recipient, token);
                        } else {
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

                var json = JSON.parse(body);
                var firstName = json.first_name;
                m_payload = m_payload.replace("{{first name}}", firstName);
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