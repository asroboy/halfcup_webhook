/**
 * Created by Ridho on 10/22/2017.
 */
module.exports = {
    foo: function (res) {
        // whatever
        // test(res);
        getAggregationObject('AGGREGATION_object=agent&query=agent=Ang%20Mo%20Kio', '228431964255924', '877390472364218', 'EAABqJD84pmIBAKZBPiJ12rk2OoZBJQzy4CcoT2CG4ZBzCKyJkRL2OMqcmuGvfryINB79U8qWx1DiV21FAZBUsHZCIsGQvId6SoCg4UqoCGxVk2FZBMZAszgVX02ZAWwoWUecALj0KycDq88ZBBN6WgeKG0QbZAXrql7IZAGX1jE2XHVmgZDZD', res);
        // getToken('AGGREGATION_object=main', '228431964255924', '877390472364218', false, res);
        // console.log("NEW N L P");
        // var token = getToken('{{greetings}}', '1965520413734063', '1676161905789453', false, res);
    },
    handleMessage: function (event, message, res) {
        var pageId = event.recipient.id;
        var userId = event.sender.id;
        getToken(message.text, pageId, userId, false, res);
    }, getMerchantId: function (pageId, recipient, text, res) {
        getToken(text, pageId, recipient, false, res);
    },
    getChatBot: function (key, sender, recipient, res) {
        getToken(key, sender, recipient, false, res);
    },
};

var async = require("async");
var request = require('request');
var http = require('http');


function getToken(text, sender, recipient, isMessageUs, res) {
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
                    console.log('token : ' + token);

                    if (text.indexOf('AGGREGATION_') > -1) {
                        getAggregationObject(text, sender, recipient, token, res);
                        saveAggregationObj(text, sender);
                    } else if (text.indexOf('{{') > -1) {
                        var key = text.replace("{{", "").replace("}}", "");
                        console.log('{{ after get token &  key = ' + key);
                        getChatBot(key, sender, recipient, token, res);
                    } else {
                        getMerchantId(sender, recipient, text, token, res);
                    }


                }
                if (code == 0) {
                    console.log('NLP : Can\'t send message, TOKEN NOT FOUND, Get page access token from facebook developer page and register to http://halfcup.com/social_rebates_system');

                }
            }
        }
    );
}

function getAggregationObject(key, sender, recipient, token, res) {
    if (key.indexOf('AGGREGATION_') > -1) {
        var mKey = key.replace('AGGREGATION_', '');
        var url = 'http://aileadsbooster.com/Backend/aggregation?' + mKey;
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
                    console.log('getChatBot RESULT: ', JSON.stringify(obj.aggregation));
                    // res.send(obj);

                    if (obj.aggregation.length > 0) {
                        // var jsonMessage = JSON.parse(obj);
                        // var randomIndex = randomIntFromInterval(1, obj.aggregation.length);
                        // console.log("randomIndex : " + randomIndex);
                        // console.log("jsonMessage.length : " + obj.aggregation.length);
                        // res.send("DONE, randomIndex " + randomIndex);
                        // respond(obj.aggregation, sender, recipient, randomIndex, token, res);
                        // randomIndex = randomIndex - 1
                        sendM(obj.aggregation, recipient, token);
                        // respondToTextOrAttacment(obj.aggregation, sender, recipient, token, randomIndex)
                    } else {
                        getDefaultAnswer(sender, recipient, token, res);
                    }

                }
            }
        );
    }

}


function saveAggregationObj(key, sender) {
    key = key.replace('&', '%26');
    var url = 'http://halfcup.com/social_rebates_system/wapi/save?token=1234567890&api_name=AGGREGATE_OBJ&aggr_key=' + key + '&page_id=' + sender;
    console.log('url', url);
    request({
            url: url,
            method: 'POST'
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                var obj = JSON.parse(body);
                console.log('getChatBot RESULT: ', obj);
            }
        }
    );
}


function getChatBot(key, sender, recipient, token, res) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/read?token=1234567890&api_name=CHATBOT&key=' + key + '&page_id=' + sender;
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
                console.log('getChatBot RESULT: ', obj);
                // res.send(obj);
                if (obj.length > 0) {
                    var jsonMessage = JSON.parse(obj[0].json);
                    var randomIndex = randomIntFromInterval(1, jsonMessage.length);
                    console.log("randomIndex : " + randomIndex);
                    console.log("jsonMessage.length : " + jsonMessage.length);
                    respond(obj, sender, recipient, randomIndex, token, res);
                } else {
                    getDefaultAnswer(sender, recipient, token, res);
                }

            }
        }
    );
}

function getMerchantId(pageId, recipient, text, token, res) {
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
                console.log('getMerchantId RESULT: ', obj);
                // res.send(obj);
                // console.log('obj: ', obj);
                // if (obj.restaurant_id !== null)
                getAiToken(pageId, recipient, obj.restaurant_id, text, token, res);
            }
        }
    );
}

function getAiToken(sender, recipient, restaurantId, text, token, res) {
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
                    getAiKeyFromDB(obj.access_token, pageId, recipient, text, token, res);
                } else {
                    // getResponseToUser(text, sender, recipient);
                }

            }
        }
    );
}

function getAiKeyFromDB(wang_token, pageId, recipient, text, token, res) {
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
                getAiKey(text, wang_token, pageId, JSON.stringify(obj.keys), recipient, token, res, obj.aggregation.aggregationKey.replace('&', '%26'));
            }
        }
    );
}

function test(res) {
    var url = 'http://aileadsbooster.com/Backend/query?access_token=0ddb61601a8bcd5b822994fdc4e061a4&q=collect';
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
                // console.log(obj)
                if (obj.aggregation.length > 0) {
                    getIndexAggregate(obj.aggregation.length, '', 'collect', obj.aggregation, '', '');
                } else {

                }
            }
        }
    );
}

function getIndexAggregate(size, pageId, key, aggreationData, recipient, token) {
    var aggr = aggreationData;
    console.log('aggreationData XX = ' + JSON.stringify(aggr));
    var url = 'http://halfcup.com/social_rebates_system/wapi/save?api_name=AGGREGATE_AI&size=' + size + '&aggregate_size=' + aggr.length + '&page_id=' + pageId + '&key=' + key + '&token=1234567890';
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
                var index = obj.data.mIndex;
                var aggrIndex = obj.data.aggrIndex;
                if(aggrIndex < aggr.length){
                    console.log('mIndex = ' + index);
                    console.log('aggrIndex = ' + aggrIndex);
                    console.log('aggreationData = ' + JSON.stringify(aggr));
                    var message = aggr[aggrIndex];
                    if (message.hasOwnProperty('message')) {
                        message = message.message;
                    }

                    var js_ = JSON.stringify(message);
                    var myEscapedJSONString = js_.escapeSpecialChars();
                    myEscapedJSONString = myEscapedJSONString.replace(/\\\\n/g, "\\n");
                    console.log("TEXT ==> " + myEscapedJSONString);
                    sendMessage(recipient, myEscapedJSONString, token);
                }


                // res.send(JSON.stringify(obj))
            }
        }
    );
}

function getAiKey(text, wang_token, pageId, prevKeys, recipient, token, res, aggregateObj) {
    var url = 'http://aileadsbooster.com/Backend/query?q=' + encodeURI(text) + '&access_token=' + wang_token + '&prev_key=' + encodeURI(prevKeys) + '&aggregation=' + encodeURI(aggregateObj);
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
                // console.log('obj = ' + JSON.stringify(obj));
                if (obj.hasOwnProperty('aggregation')) {

                    console.log('AGGREGATION LENGTH = ' + obj.aggregation.length);
                    if (obj.aggregation.length > 0) {
                        getIndexAggregate(obj.aggregation.length, pageId, obj.key, obj.aggregation, recipient, token);
                    } else {
                        if (obj.key === '') {
                            getDefaultAnswer(pageId, recipient, token, res);
                        } else {
                            // console.log('obj: ', obj);
                            saveAiKey(obj.key, pageId, recipient, token, res);
                        }
                    }

                } else {
                    if (obj.key === '') {
                        getDefaultAnswer(pageId, recipient, token, res);
                    } else {
                        // console.log('obj: ', obj);
                        saveAiKey(obj.key, pageId, recipient, token, res);
                    }
                }


            }
        }
    );
}

function saveAiKey(key, pageId, recipient, token, res) {
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
                getChatBot(key, pageId, recipient, token, res)
            }
        }
    );
}

function respond(jsonMessage, sender, recipient, index, token, res) {
    index = index - 1;
    console.log('json: ', jsonMessage);
    if (isGroup(jsonMessage, index)) {
        console.log('GROUP');
        var json = JSON.parse(jsonMessage[0].json);
        var key = json[index].group.key;
        console.log('key: ', key);

        getGroupBot(key, sender, recipient, token, res);
    } else if (isChatBot(jsonMessage, index)) {
        console.log('CHATBOT');
        var json = JSON.parse(jsonMessage[0].json);
        // res.send(json);
        respondToTextOrAttacment(json, sender, recipient, token, index)
    } else {
        getDefaultAnswer(sender, recipient, token, res);
    }
}

function respondToTextOrAttacment(json, sender, recipient, token, index) {

    console.log(index);
    //text
    if (json[index].message.text) {
        var message = json[index].message.text;
        console.log(message);
        sendMorA(message, recipient, token)
        //attachment
    } else {
        var message = json[index].message;
        console.log(message);
        sendMorA(message, recipient, token)
    }
}

function sendMorA(m_payload, recipient, token) {
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

            var js_ = JSON.stringify(message);
            var myEscapedJSONString = js_.escapeSpecialChars();
            myEscapedJSONString = myEscapedJSONString.replace(/\\\\n/g, "\\n");
            console.log("TEXT ==> " + myEscapedJSONString);
            sendMessage(recipient, myEscapedJSONString, token);
        }
    }
}

function getGroupBot(key, sender, recipient, token, res) {
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
                respondFromGroup(obj, sender, recipient, jsonMessage.length, token, res);
            }
        }
    );
}


function respondFromGroup(jsonMessage, sender, recipient, size, token, res) {
    var json = JSON.parse(jsonMessage[0].json);
    sendM(json, recipient, token);

    // res.send('~ DONE ~');
}


function getDefaultAnswer(sender, recipient, token, res) {
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
                    respond(obj, sender, recipient, randomIndex, token, res);
                }
            }
        }
    );
}

//HELPER
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function isGroup(jsonMessage, index) {
    var json = JSON.parse(jsonMessage[0].json);
    return json[index] && json[index].group;
}

function isChatBot(jsonMessage, index) {
    var json = JSON.parse(jsonMessage[0].json);
    return json[index] && json[index].message;
}

function sendM(messages, recipient, token) {
    var i = 0;

    function getOneM(messages) {
        console.log('i ' + i);
        var message = messages[i];
        var m = '';
        if (message.message.attachment) {
            m = message.message;
        } else {
            // m = {"text": message.message.text};
            m = message.message;
        }
        console.log('m ' + JSON.stringify(m));
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: token},
            method: 'POST',
            json: {
                recipient: {id: recipient},
                message: m,
            }
        }, function (err, resp, body) {
            console.log("--->  " + JSON.stringify(body));
        }).on('end', function () {
            console.log("done with ONE user ");
            if (i < messages.length) { // do we still have users to make requests?
                getOneM(messages); // recursion
            } else {
                console.log("done with ALL users");
                // res.json(success);
            }
        });

        i++;
    }

    // make a copy of the original users Array because we're going to mutate it
    getOneM(Array.from(messages));
}

// generic function sending messages
function sendMessage(recipientId, message, token) {
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
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            // console.log('============ ' + response + ' =========== ');
        }
    });
};