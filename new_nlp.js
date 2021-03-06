/**
 * Created by Ridho on 10/22/2017.
 */
module.exports = {
    foo: function (res) {
        // whatever
        // test(res);
        // getAggregationObject('AGGREGATION_object=agent&query=agent=Ang%20Mo%20Kio', '228431964255924', '877390472364218', 'EAABqJD84pmIBAKZBPiJ12rk2OoZBJQzy4CcoT2CG4ZBzCKyJkRL2OMqcmuGvfryINB79U8qWx1DiV21FAZBUsHZCIsGQvId6SoCg4UqoCGxVk2FZBMZAszgVX02ZAWwoWUecALj0KycDq88ZBBN6WgeKG0QbZAXrql7IZAGX1jE2XHVmgZDZD', res);
        // getToken('AGGREGATION_object=main', '228431964255924', '877390472364218', false, res);
        // console.log("NEW N L P");
        // var token = getToken('{{greetings}}', '1965520413734063', '1676161905789453', false, res);
    },
    handleMessage: function (event, message, res) {
        var pageId = event.recipient.id;
        var userId = event.sender.id;
        getToken(message.text, pageId, userId, false, res, 'HANDLE_MESSAGE', "");
    }, getMerchantId: function (pageId, recipient, text, res) {
        getToken(text, pageId, recipient, false, res, 'GET_MERCHANT_ID', "");
    }, getChatBot: function (key, sender, recipient, res) {
        getToken(key, sender, recipient, false, res, 'GET_CHAT_BOT', "");
    }, phoneAction: function (key, pageId, recipient, res, AGGR) {
        getToken(key, pageId, recipient, false, res, 'PHONE_ACTION', AGGR);
    },


};

var async = require("async");
var request = require('request');
var http = require('http');
var autotask = require('./autotask/index');
var page_subscription = require('./page_msg_subs/index');

function getToken(text, sender, recipient, isMessageUs, res, action_name, AGGR) {
    var url = 'http://halfcup.com/social_rebates_system/api/getPageMessengerToken?messenger_id=' + sender + '&messenger_uid=' + recipient;
    console.log('# new_nlp getToken() text', text + 'action_name ' + action_name);
    console.log('# GET PAGE TOKEN url', url);
    console.log('action name', action_name);
    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                console.log('Error : ', "GET TOKEN " + error);
            } else if (response.body.error) {
                console.log('Error: ', "GET TOKEN " + response.body.error);
            } else {
                var obj = JSON.parse(body);
                var code = obj.code;

                if (code == 1) {
                    var token = obj.messenger_data.pageAccessToken;
                    console.log('==> PAGE TOKEN token : ' + token);
                    showLoading(token, recipient);

                    if (text !== null) {
                        if (text.indexOf('DONE_BOT') > -1) {
                            var text_ = text.split('\|param\|')[1];

                            getParamDoneBot('', sender, recipient, token, res, text_);
                            // getAggregationObject(text, sender, recipient, token, res);
                            saveAggregationObj(text_, sender);
                        } else if (text.indexOf('AGGREGATION_') > -1) {
                            getParam(text, sender, recipient, token, res);
                            // getAggregationObject(text, sender, recipient, token, res);
                            saveAggregationObj(text, sender);
                        } else if (text.indexOf('{{') > -1) {
                            if (text.indexOf('_') > -1) {
                                var param = text.split("_")[1];
                                var key = text.split("_")[0].replace("{{", "").replace("}}", "");
                                console.log('{{ after get token &  key = ' + key);
                                getChatBot(key, sender, recipient, token, res);
                                // getAggregationObject(text, sender, recipient, token, res);
                                // saveAggregationObj(text, sender);
                            } else {
                                var key = text.replace("{{", "").replace("}}", "");
                                console.log('{{ after get token &  key = ' + key);
                                getChatBot(key, sender, recipient, token, res);
                            }

                        } else if (text.indexOf('LIVE') > -1) {
                            var key = text.replace("LIVE_", "");
                            console.log('LIVE after get token &  key = ' + key);
                            // getChatBot(text, sender, recipient, token, res);
                            var m = JSON.parse('{\"text\":\"Hi, the agent has been notified. We will be glad to support you\"}');
                            var js_ = JSON.stringify(m);
                            var myEscapedJSONString = js_.escapeSpecialChars();
                            myEscapedJSONString = myEscapedJSONString.replace(/\\\\n/g, "\\n");
                            console.log("TEXT ==> " + myEscapedJSONString);
                            sendMessage(sender, recipient, myEscapedJSONString, token);

                            var message = 'Hi, someone asking for Live Inquiries in messenger, <br>Thanks';
                            sendEmailForAi('LIVE Inquiries'.message, recipient, key.split('=')[1], token, recipient);
                            // getEmail('Someone asking for LIVE Inquiries in chatroom', recipient);
                        } else if (text.indexOf('CUSTOM') > -1) {
                            var key = text.replace("CUSTOM_", "");
                            console.log('CUSTOM_ after get token &  key = ' + key);
                            getChatBot(key, sender, recipient, token, res);
                            var message = 'Hi, someone clicked on Fengsui Brows Photos, <br>Thanks';
                            //audreychen531@yahoo.com.sg
                            sendEmailForAi('LIVE Inquiries', message, recipient, 'brotherho@halfcup.com', token, recipient);
                        }
                        else {
                            if (action_name !== 'PHONE_ACTION') {
                                getMerchantId(sender, recipient, text, token, res);
                                get_tracking_id("", recipient, text, false);
                            } else {
                                getMerchantIdForPhone(sender, recipient, text, token, res, AGGR)
                            }
                        }
                    }

                }
                if (code == 0) {
                    hideLoading(token, recipient);
                    console.log('NLP : Can\'t send message, TOKEN NOT FOUND, Get page access token from facebook developer page and register to http://halfcup.com/social_rebates_system, ' +
                        'page_id : ' + sender);

                }
            }
        }
    );
}


function showLoading(token, recipientId) {
    request({
        url: 'https://graph.facebook.com/v2.8/me/messages',
        qs: {access_token: token},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            sender_action: "typing_on"
        }
    }, function (error, response, body) {
    });
}


function hideLoading(token, recipientId) {
    request({
        url: 'https://graph.facebook.com/v2.8/me/messages',
        qs: {access_token: token},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            sender_action: "typing_off"
        }
    }, function (error, response, body) {
    });
}

function getParamDoneBot(key, sender, recipient, token, res, id) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/read?token=1234567890&api_name=PARAMS_AI_ITEM&id=' + id.split("=")[1];
    console.log('url', url);
    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                hideLoading(token, recipient);
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                hideLoading(token, recipient);
                console.log('Error: ', response.body.error);
            } else {
                var obj = JSON.parse(body);
                console.log('==> PARAM AI ITEM RESULT: ', obj);
                if (obj.data !== null) {
                    var param = obj.data.prm;
                    getThirdPartyPageID(key, sender, recipient, token, res, param);
                    // getAggregationObjectDoneBot(key, sender, recipient, token, res, param);
                }

            }
        }
    );
}


function getThirdPartyPageID(key, sender, recipient, token, res, param) {
    var url = 'http://halfcup.com//social_rebates_system/app/get3rdParty?page_id=' + sender;
    console.log('url : ' + url);
    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                hideLoading(token, recipient);
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                hideLoading(token, recipient);
                console.log('Error: ', response.body.error);
            } else {
                var obj = JSON.parse(body);
                console.log('get 3rd Party pageid RESULT: ', JSON.stringify(obj.aggregation));
                // res.send(obj);
                if (obj.data !== 'not found') {
                    getAggregationObjectDoneBot(key, sender, recipient, token, res, param, obj.data);
                } else {
                    getAggregationObjectDoneBot(key, sender, recipient, token, res, param, "");
                }

            }
        }
    );
}


function getThirdPartyPageID_1(text, wang_token, pageId, prevKeys, recipient, token, res, aggregateObj, param) {
    var url = 'http://halfcup.com//social_rebates_system/app/get3rdParty?page_id=' + pageId;
    console.log('url : ' + url);
    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                hideLoading(token, recipient);
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                hideLoading(token, recipient);
                console.log('Error: ', response.body.error);
            } else {
                var obj = JSON.parse(body);
                console.log('get 3rd Party pageid RESULT: ', JSON.stringify(obj.aggregation));
                // res.send(obj);
                if (obj.data !== 'not found') {
                    getAiKey(text, wang_token, pageId, prevKeys, recipient, token, res, aggregateObj, param, obj.data);
                } else {
                    getAiKey(text, wang_token, pageId, prevKeys, recipient, token, res, aggregateObj, param, '');
                }

            }
        }
    );
}


function getThirdPartyPageID_2(key, sender, recipient, token, res, param) {
    var url = 'http://halfcup.com//social_rebates_system/app/get3rdParty?page_id=' + sender;
    console.log('url : ' + url);
    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                hideLoading(token, recipient);
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                hideLoading(token, recipient);
                console.log('Error: ', response.body.error);
            } else {
                var obj = JSON.parse(body);
                console.log('get 3rd Party pageid RESULT: ', JSON.stringify(obj.aggregation));
                // res.send(obj);
                if (obj.data !== 'not found') {
                    getAggregationObject(key, sender, recipient, token, res, param, obj.data);
                } else {
                    getAggregationObject(key, sender, recipient, token, res, param, "");
                }

            }
        }
    );
}

function getAggregationObjectDoneBot(key, sender, recipient, token, res, param, third_party) {
    var mKey = param.replace('AGGREGATION_', '');
    var url = 'http://aileadsbooster.com/Backend/aggregation?' + mKey + '&third-party=' + third_party;
    console.log('url', url);

    check_tracking_id(key, recipient, token);

    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                hideLoading(token, recipient);
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                hideLoading(token, recipient);
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
                    sendM(sender, obj.aggregation, recipient, token, res, obj);
                    // respondToTextOrAttacment(obj.aggregation, sender, recipient, token, randomIndex)
                } else {
                    getDefaultAnswer(sender, recipient, token, res);
                }


            }
        }
    );
}

function getParam(key, sender, recipient, token, res) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/read?token=1234567890&api_name=PARAMS_AI&user_msg_id=' + recipient + '&page_id=' + sender;
    console.log('# PARAM AI url', url);
    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                hideLoading(token, recipient);
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                hideLoading(token, recipient);
                console.log('Error: ', response.body.error);
            } else {
                var obj = JSON.parse(body);
                console.log('==> PARAM AI RESULT: ', JSON.stringify(obj));
                if (obj.data !== null) {
                    var param = obj.data.prm;
                    getThirdPartyPageID_2(key, sender, recipient, token, res, param);
                    //getAggregationObject(key, sender, recipient, token, res, param);
                } else {
                    getAggregationObject(key, sender, recipient, token, res, null, "");
                }
            }
        }
    );
}

function getAggregationObject(key, sender, recipient, token, res, param, third_party) {
    if (key.indexOf('AGGREGATION_') > -1) {
        var mKey = key.replace('AGGREGATION_', '');
        var url = '';
        if (mKey === 'object=main') {
            url = 'http://aileadsbooster.com/Backend/aggregation?' + mKey + '&query=' + param + '&third-party=' + third_party;
        } else {
            if (mKey.indexOf("{{") > -1) {
                mKey = mKey.replace("{{", "").replace("}}", "");
            }
            mKey = mKey.replace('%26', '&');
            if (param === null) {
                url = 'http://aileadsbooster.com/Backend/aggregation?' + mKey + '&third-party=' + third_party
            } else {
                var mParam = param;
                if (param.indexOf('param=') > -1) {
                    mParam = param.split('param=')[1];
                }
                url = 'http://aileadsbooster.com/Backend/aggregation?' + mKey + '&param=' + mParam + '&third-party=' + third_party
            }

        }


        check_tracking_id(key, recipient, token);

        console.log('# AGGREGATION API url', url);
        request({
                url: url,
                method: 'GET'
            }, function (error, response, body) {
                if (error) {
                    hideLoading(token, recipient);
                    console.log('Error sending message: ', error);
                } else if (response.body.error) {
                    hideLoading(token, recipient);
                    console.log('Error: ', response.body.error);
                } else {

                    try {
                        var obj = JSON.parse(body);
                        console.log('==> AGGREGATION API RESULT: ', JSON.stringify(obj.aggregation));
                        // res.send(obj);

                        if (obj.aggregation.length > 0) {
                            // var jsonMessage = JSON.parse(obj);
                            // var randomIndex = randomIntFromInterval(1, obj.aggregation.length);
                            // console.log("randomIndex : " + randomIndex);
                            // console.log("jsonMessage.length : " + obj.aggregation.length);
                            // res.send("DONE, randomIndex " + randomIndex);
                            // respond(obj.aggregation, sender, recipient, randomIndex, token, res);
                            // randomIndex = randomIndex - 1
                            sendM(sender, obj.aggregation, recipient, token, res, obj);
                            // respondToTextOrAttacment(obj.aggregation, sender, recipient, token, randomIndex)
                        } else {
                            getDefaultAnswer(sender, recipient, token, res);
                        }

                    } catch (error) {
                        console.log("Error catched ==>", error);
                        hideLoading(token, recipient);
                        // res.sendStatus(500);
                    }


                }
            }
        );
    }

}


function saveAggregationObj(key, sender) {
    key = key.replace('&', '%26');
    var url = 'http://halfcup.com/social_rebates_system/wapi/save?token=1234567890&api_name=AGGREGATE_OBJ&aggr_key=' + key + '&page_id=' + sender;
    console.log('# SAVE AGGREGATION API url', url);
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
                console.log('==> SAVE AGGREGATION API RESULT: ', JSON.stringify(obj));
            }
        }
    );
}


function getChatBot(key, sender, recipient, token, res) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/read?token=1234567890&api_name=CHATBOT&key=' + key + '&page_id=' + sender;
    console.log('# GET CHAT BOT url', url);
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
                console.log('==> GET CHATBOT API RESULT: ', JSON.stringify(obj));
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
    //develpment, ATP, UMOBILE
    if (pageId === '1965520413734063' || pageId === '228431964255924') { //pageId === '1724621464435440'
        console.log("DI DALAM PENGECUALIAN");
        autotask.test(res, recipient, pageId, token);
    } else if (pageId === '474086889694869') {
        console.log("DI DALAM PENGECUALIAN -- AI REPLY");
        page_subscription.reply(text, recipient, pageId, token);
    } else {
        var url = 'http://halfcup.com/social_rebates_system/wapi/read?api_name=GET_RESTAURANT&token=1234567890&page_id=' + pageId;
        console.log('# GET MERCHANT ID url', url);
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
                    console.log('==> GET MERCHANT ID RESULT: ', JSON.stringify(obj));
                    // res.send(obj);
                    // console.log('obj: ', obj);
                    // if (obj.restaurant_id !== null)
                    getAiToken(pageId, recipient, obj.restaurant_id, text, token, res, false, "");
                }
            }
        );
    }

}

function getMerchantIdForPhone(pageId, recipient, text, token, res, AGGR) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/read?api_name=GET_RESTAURANT&token=1234567890&page_id=' + pageId;
    console.log('# GET MERCHANT ID url', url);
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
                console.log('==> GET MERCHANT ID RESULT: ', JSON.stringify(obj));
                // res.send(obj);
                // console.log('obj: ', obj);
                // if (obj.restaurant_id !== null)
                getAiToken(pageId, recipient, obj.restaurant_id, text, token, res, true, AGGR);
            }
        }
    );
}

function getAiToken(sender, recipient, restaurantId, text, token, res, isPhone, AGGR) {
    var url = 'http://aileadsbooster.com/backend/getEnvironment?page_id=' + sender + '&merchant_id=' + restaurantId + '&lang=en';
    console.log('# GET AI TOKEN url', url);
    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                console.log('Error : ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                if (body.indexOf('<') > -1) {

                } else {
                    var obj = JSON.parse(body);
                    console.log('==> GET AI TOKEN RESULT : ', JSON.stringify(obj));
                    if (obj.access_token !== '') {
                        var pageId = sender;
                        if (isPhone) {
                            getAiKeyForPhone(text, obj.access_token, pageId, recipient, token, res, AGGR);
                        } else {
                            getAiKeyFromDB(obj.access_token, pageId, recipient, text, token, res);
                        }

                    } else {
                        // getResponseToUser(text, sender, recipient);
                    }
                }
            }
        }
    );
}

function getAiKeyFromDB(wang_token, pageId, recipient, text, token, res) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/read?api_name=AI_PREV_KEYS&token=1234567890&page_id=' + pageId;
    console.log('# AI PREV KEY url', url);
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
                console.log('==> AI PREV KEY RESULT: ', JSON.stringify(obj));
                var agk = '';
                if (obj.hasOwnProperty('aggregation')) {
                    if (obj.aggregation) {
                        if (obj.aggregation.hasOwnProperty('aggregationKey')) {
                            agk = obj.aggregation.aggregationKey;
                            agk = agk.replace('&', '%26');
                        }
                    }
                }

                getParamForAiKey(text, wang_token, pageId, JSON.stringify(obj.keys), recipient, token, res, agk);
                // getParam(text, sender, recipient, token, res);
                // getAiKey(text, wang_token, pageId, JSON.stringify(obj.keys), recipient, token, res, agk);
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
                if (aggrIndex < aggr.length) {
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
                    sendMessage(pageId, recipient, myEscapedJSONString, token);
                }


                // res.send(JSON.stringify(obj))
            }
        }
    );
}

function getAiKey(text, wang_token, pageId, prevKeys, recipient, token, res, aggregateObj, param, third_party) {

    console.log('AGGREGATION OBJECT >>>>>>>>>>>>>>>> ', aggregateObj);
    // get_tracking_id(param, recipient, text);

    if (aggregateObj.indexOf("{{") > -1) {
        aggregateObj = aggregateObj.replace("{{", "").replace("}}", "");
    }
    var url = 'http://aileadsbooster.com/Backend/query?q=' + encodeURI(text) + '&access_token=' + wang_token + '&prev_key=' + prevKeys + '&aggregation=' + aggregateObj + '&param=' + param + '&third-party=' + third_party;
    if (aggregateObj === '') {
        url = 'http://aileadsbooster.com/Backend/query?q=' + encodeURI(text) + '&access_token=' + wang_token + '&prev_key=' + prevKeys + '&param=' + param;
    } else {
        url = 'http://aileadsbooster.com/Backend/query?q=' + encodeURI(text) + '&access_token=' + wang_token + '&prev_key=' + prevKeys + '&aggregation=' + aggregateObj + '&param=' + param + '&third-party=' + third_party;
    }
    console.log('# BACKEND QUERY API url', url);
    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                console.log('Error : ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                try {
                    var obj = JSON.parse(body);
                    console.log('==>BAKCEND QUERY API RESULT : ' + JSON.stringify(obj));
                    if (obj.hasOwnProperty('aggregation')) {
                        console.log('AGGREGATION LENGTH = ' + obj.aggregation.length);
                        if (obj.aggregation.length > 0) {
                            sendM(pageId, obj.aggregation, recipient, token, res, obj);
                            // getIndexAggregate(obj.aggregation.length, pageId, obj.key, obj.aggregation, recipient, token);
                            saveAiKeyWithoutGetBot(obj.key, pageId, recipient, token, res)
                            // saveAiKey(obj.key, pageId, recipient, token, res);
                        } else {
                            if (obj.key === '') {
                                getDefaultAnswer(pageId, recipient, token, res);
                            } else {
                                // console.log('obj: ', obj);
                                saveAiKey(obj.key, pageId, recipient, token, res);
                                saveAggregationObj('', pageId);
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

                } catch (error) {
                    console.log("Error catched ==>", error);
                    hideLoading(token, recipient);
                    // res.sendStatus(500);
                }

            }
        }
    );
}


function getAiKeyForPhone(text, wang_token, pageId, recipient, token, res, AGGR) {

    console.log('AGGREGATION OBJECT >>>>>>>>>>>>>>>> ', text);
    // get_tracking_id(param, recipient, text);
    // var agr = AGGR.replace('AGGREGATION_object=', '');
    var agr = AGGR.replace('&', '%26')

    var url = 'http://aileadsbooster.com/Backend/query?q=' + encodeURI(text.replace('+', '')) + '&access_token=' + wang_token + '&aggregation=' + agr;

    console.log('# BACKEND QUERY API (PHONE) url', url);
    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                console.log('Error : ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                try {
                    var obj = JSON.parse(body);
                    console.log('==>BAKCEND QUERY API RESULT : ' + JSON.stringify(obj));
                    if (obj.hasOwnProperty('aggregation')) {
                        console.log('AGGREGATION LENGTH = ' + obj.aggregation.length);
                        if (obj.aggregation.length > 0) {
                            sendM(pageId, obj.aggregation, recipient, token, res, obj);
                            // getIndexAggregate(obj.aggregation.length, pageId, obj.key, obj.aggregation, recipient, token);
                            saveAiKeyWithoutGetBot(obj.key, pageId, recipient, token, res)
                            // saveAiKey(obj.key, pageId, recipient, token, res);
                        } else {
                            if (obj.key === '') {
                                getDefaultAnswer(pageId, recipient, token, res);
                            } else {
                                // console.log('obj: ', obj);
                                saveAiKey(obj.key, pageId, recipient, token, res);
                                saveAggregationObj('', pageId);
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

                } catch (error) {
                    console.log("Error catched ==>", error);
                    hideLoading(token, recipient);
                    // res.sendStatus(500);
                }

            }
        }
    );
}

function getParamForAiKey(text, wang_token, pageId, prevKeys, recipient, token, res, agk) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/read?token=1234567890&api_name=PARAMS_AI&user_msg_id=' + recipient + '&page_id=' + pageId;
    console.log('# PARAM AI url', url);
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
                console.log('==> PARAM AI RESULT: ', JSON.stringify(obj));
                if (obj.data !== null) {
                    var param = obj.data.prm;
                    // getAggregationObject(key, sender, recipient, token, res, param);
                    getThirdPartyPageID_1(text, wang_token, pageId, prevKeys, recipient, token, res, agk, param);
                    // getAiKey(text, wang_token, pageId, prevKeys, recipient, token, res, agk, param);
                }

            }
        }
    );
}


function saveAiKeyWithoutGetBot(key, pageId, recipient, token, res) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/save?api_name=AI_PREV_KEYS&key=' + key + '&token=1234567890&page_id=' + pageId;
    console.log('# SAVE AI PREV KEY url', url);
    request({
            url: url,
            method: 'POST'
        }, function (error, response, body) {
            if (error) {
                console.log('Error : ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {

            }
        }
    );
}

function saveAiKey(key, pageId, recipient, token, res) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/save?api_name=AI_PREV_KEYS&key=' + key + '&token=1234567890&page_id=' + pageId;
    console.log('# SAVE AI PREV KEY url', url);
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
                console.log('SAVE AI KEY RESULT: ', obj);
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
        sendMorA(sender, message, recipient, token)
        //attachment
    } else {
        var message = json[index].message;
        console.log(message);
        sendMorA(sender, message, recipient, token)
    }
}

function sendMorA(page_id, m_payload, recipient, token) {
    if (m_payload.attachment) {
        if (m_payload.attachment.payload.hasOwnProperty('is_reusable')) {
            if (m_payload.attachment.payload.is_reusable === true) {
                check_attachment_uploaded(page_id, recipient, m_payload, token);
            } else {
                sendMessage(page_id, recipient, m_payload, token);
            }
        } else {
            // var myEscapedJSONString = m_payload.escapeSpecialChars();
            // myEscapedJSONString = myEscapedJSONString.replace(/\\\\n/g, "\\n");
            // console.log("TEXT ==> " + myEscapedJSONString);

            sendMessage(page_id, recipient, m_payload, token);
        }

    } else {
        if (m_payload.indexOf('{{') > -1) {
            getUserInfo(m_payload, recipient, token);
        } else {
            var message = {"text": m_payload};

            var js_ = JSON.stringify(message);
            var myEscapedJSONString = js_.escapeSpecialChars();
            myEscapedJSONString = myEscapedJSONString.replace(/\\\\n/g, "\\n");
            console.log("TEXT ==> " + myEscapedJSONString);
            sendMessage(page_id, recipient, myEscapedJSONString, token);
        }
    }
}

function getGroupBot(key, sender, recipient, token, res) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/read?token=1234567890&api_name=GROUP&key=' + key;
    // + '&page_id=' + sender;
    console.log('# GROUP WAPI url', url);
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
                console.log('==> GROUP WAPI RESULT :', JSON.stringify(obj))
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
    sendM(sender, json, recipient, token, res, jsonMessage);

    // res.send('~ DONE ~');
}


function getDefaultAnswer(sender, recipient, token, res) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/read?token=1234567890&api_name=DEFAULT_ANSWER&page_id=' + sender + '&is_on=true';
    console.log('# DEFAULT ANSWER API url', url);
    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                hideLoading(token, recipient);
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                hideLoading(token, recipient);
                console.log('Error: ', response.body.error);
            } else {
                var obj = JSON.parse(body);
                console.log('==> DEFAULT ANSWER API RESULT :', JSON.stringify(obj));
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

function sendM(page_id, messages, recipient, token, res, obj) {
    var i = 0;

    function getOneM(messages) {
        console.log('i ' + i);
        var message = messages[i];
        var m = '';
        if (message.message.attachment) {
            m = message.message;
            if (m.attachment.payload.hasOwnProperty('is_reusable')) {
                if (m.attachment.payload.is_reusable === true) {
                    var url = 'http://halfcup.com/social_rebates_system/apix/get_messenger_attachment_id?page_id=' + page_id + '&url=' + m.attachment.payload.url;
                    console.log('# GET ATTACHMENT ID url', url);
                    request({
                        url: url,
                        method: 'GET'
                    }, function (error, response, body) {
                        if (error) {
                            hideLoading(token, recipient);
                            console.log('Error : ', error);
                        } else if (response.body.error) {
                            hideLoading(token, recipient);
                            console.log('Error: ', response.body.error);
                        } else {
                            var obj = JSON.parse(body);
                            console.log('==> GET ATTACHMENT ID RESULT :', JSON.stringify(obj));
                            if (obj.attachment_id !== null) {
                                console.log('ATTACHMENT ID :', obj.attachment_id);
                                m.attachment.payload = {attachment_id: obj.attachment_id};
                                console.log('m ' + JSON.stringify(m));
                                request({
                                    url: 'https://graph.facebook.com/v2.8/me/messages',
                                    qs: {access_token: token},
                                    method: 'POST',
                                    json: {
                                        recipient: {id: recipient},
                                        message: m,
                                    }
                                }, function (err, resp, body) {
                                    console.log("--->  " + JSON.stringify(body));
                                    if (err) {
                                        hideLoading(token, recipient);
                                        update_webhook_status(page_id, "Error: " + err);
                                    }
                                }).on('end', function () {
                                    console.log("done with ONE user ");
                                    if (i < messages.length) { // do we still have users to make requests?
                                        getOneM(messages); // recursion
                                    } else {
                                        update_webhook_status(page_id, "OK");
                                        console.log("done with ALL users");

                                        //RESERVED API
                                        if (obj.hasOwnProperty('reserved')) {
                                            if (obj.reserved.length > 0) {
                                                var reserved_parameter = obj.reserved;
                                                autotask.startAutoReply(res, recipient, page_id, token, reserved_parameter);
                                            }
                                        }

                                    }
                                });
                            } else {
                                var url = 'https://graph.facebook.com/v2.8/me/message_attachments?access_token=' + token;
                                console.log('# SAVE ATTACHMENT ID url', url);
                                console.log('# message(m) ', JSON.stringify(m));
                                request({
                                    url: url,
                                    method: 'POST',
                                    json: {
                                        message: m,
                                    }
                                }, function (error, response, body_) {
                                    if (error) {
                                        console.log('Error : ', error);
                                    } else if (response.body.error) {
                                        console.log('Error: ', response.body.error);
                                    } else {
                                        // var obj = JSON.parse(body_);
                                        console.log('# SAVE ATTACHMENT ID RESULT ', JSON.stringify(body_));
                                        save_uploaded_attachmentid_m(body_.attachment_id, page_id, recipient, m, token);
                                        m.attachment.payload = {attachment_id: body_.attachment_id};
                                        console.log('m ' + JSON.stringify(m));
                                        request({
                                            url: 'https://graph.facebook.com/v2.8/me/messages',
                                            qs: {access_token: token},
                                            method: 'POST',
                                            json: {
                                                recipient: {id: recipient},
                                                message: m,
                                            }
                                        }, function (err, resp, body) {
                                            console.log("--->  " + JSON.stringify(body));
                                            if (err) {
                                                hideLoading(token, recipient);
                                                update_webhook_status(page_id, "Error: " + err);
                                            }
                                        }).on('end', function () {
                                            console.log("done with ONE user ");
                                            if (i < messages.length) { // do we still have users to make requests?
                                                getOneM(messages); // recursion
                                            } else {
                                                update_webhook_status(page_id, "OK");
                                                console.log("done with ALL users");

                                                //RESERVED API
                                                if (obj.hasOwnProperty('reserved')) {
                                                    if (obj.reserved.length > 0) {
                                                        var reserved_parameter = obj.reserved;
                                                        autotask.startAutoReply(res, recipient, page_id, token, reserved_parameter);
                                                    }
                                                }

                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            } else {
                // m = {"text": message.message.text};
                m = message.message;
                console.log('m ' + JSON.stringify(m));
                request({
                    url: 'https://graph.facebook.com/v2.8/me/messages',
                    qs: {access_token: token},
                    method: 'POST',
                    json: {
                        recipient: {id: recipient},
                        message: m,
                    }
                }, function (err, resp, body) {
                    console.log("--->  " + JSON.stringify(body));
                    if (err) {
                        hideLoading(token, recipient);
                        update_webhook_status(page_id, "Error: " + err);
                    }
                }).on('end', function () {
                    console.log("done with ONE user ");
                    if (i < messages.length) { // do we still have users to make requests?
                        getOneM(messages); // recursion
                    } else {
                        update_webhook_status(page_id, "OK");
                        console.log("done with ALL users");

                        //RESERVED API
                        if (obj.hasOwnProperty('reserved')) {
                            if (obj.reserved.length > 0) {
                                var reserved_parameter = obj.reserved;
                                autotask.startAutoReply(res, recipient, page_id, token, reserved_parameter);
                            }
                        }

                    }
                });
            }
        } else {
            // m = {"text": message.message.text};
            m = message.message;
            console.log('m ' + JSON.stringify(m));
            request({
                url: 'https://graph.facebook.com/v2.8/me/messages',
                qs: {access_token: token},
                method: 'POST',
                json: {
                    recipient: {id: recipient},
                    message: m,
                }
            }, function (err, resp, body) {
                console.log("--->  " + JSON.stringify(body));
                if (err) {
                    hideLoading(token, recipient);
                    update_webhook_status(page_id, "Error: " + err);
                }
            }).on('end', function () {
                console.log("done with ONE user ");
                if (i < messages.length) { // do we still have users to make requests?
                    getOneM(messages); // recursion
                } else {
                    update_webhook_status(page_id, "OK");
                    console.log("done with ALL users");

                    //RESERVED API
                    if (obj.hasOwnProperty('reserved')) {
                        if (obj.reserved.length > 0) {
                            var reserved_parameter = obj.reserved;
                            autotask.startAutoReply(res, recipient, page_id, token, reserved_parameter);
                        }
                    }

                }
            });
        }


        i++;
    }

    // make a copy of the original users Array because we're going to mutate it
    getOneM(Array.from(messages));
}

// generic function sending messages
function sendMessage(page_id, recipientId, message, token) {
    request({
        url: 'https://graph.facebook.com/v2.8/me/messages',
        qs: {access_token: token},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function (error, response, body) {
        if (error) {
            update_webhook_status(page_id, "Error: " + error);
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            update_webhook_status(page_id, "Error: " + response.body.error);
            console.log('Error: ', response.body.error);
        } else {
            update_webhook_status(page_id, "OK");
            // console.log('============ ' + response + ' =========== ');
        }
    });
};


// generic function sending messages
function getEmail(message, page_id, token, recipient) {
    var url = 'http://halfcup.com/social_rebates_system/apix?page_id=' + page_id;
    request({
        url: url,
        method: 'GET',
    }, function (error, response, body) {
        if (error) {
            hideLoading(token, recipient);
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            hideLoading(token, recipient);
            console.log('Error: ', response.body.error);
        } else {
            sendEmailForAi('LIVE Inquiries', message, page_id, 'brotherho@halfcup.com', token, recipient);
        }
    });
};

function sendEmailForAi(title, message, page_id, email, token, recipient) {

    var result = "Page ID " + page_id + "<br/>";
    result = result + message;
    //brotherho@halfcup.com

    var url = 'http://halfcup.com/social_rebates_system/api/sendEmail?' +
        'sender=noreply@halfcup.com' +
        '&receiver=' + email +
        '&subject= ' + title +
        '&body=' + result;
    console.log('url', url);
    request({
        url: url,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            hideLoading(token, recipient);
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            hideLoading(token, recipient);
            console.log('Error: ', response.body.error);
        } else {
            console.log('Send email ', "OK");
        }
    });

}


function check_attachment_uploaded(page_id, recipientId, message, token) {
    var url = 'http://halfcup.com/social_rebates_system/apix/get_messenger_attachment_id?page_id=' + page_id + '&url=' + message.attachment.payload.url;
    console.log('# GET ATTACHMENT ID url', url);
    request({
        url: url,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            hideLoading(token, recipientId);
            console.log('Error : ', error);
        } else if (response.body.error) {
            hideLoading(token, recipientId);
            console.log('Error: ', response.body.error);
        } else {
            var obj = JSON.parse(body);
            console.log('==> GET ATTACHMENT ID RESULT :', JSON.stringify(obj));
            if (obj.attachment_id !== null) {
                message.attachment.payload = {attachment_id: obj.attachment_id};
                sendMessage(page_id, recipientId, message, token);
            } else {
                upload_attachement(page_id, recipientId, message, token);
            }
        }
    });
}


function save_uploaded_attachmentid_m(attachment_id, page_id, recipientId, message, token) {
    var url = 'http://halfcup.com/social_rebates_system/apix/save_messenger_attachment_id?page_id=' + page_id
        + '&url=' + message.attachment.payload.url
        + '&type=' + message.attachment.type
        + '&attachment_id=' + attachment_id;
    console.log('# SAVE ATTACHMENT ID url', url);
    console.log('# url file ', message.attachment.payload.url);
    console.log('# type file ', message.attachment.type);
    request({
        url: url,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            hideLoading(token, recipientId);
            console.log('Error : ', error);
        } else if (response.body.error) {
            hideLoading(token, recipientId);
            console.log('Error: ', response.body.error);
        } else {
            var obj = JSON.parse(body);
            console.log('==> SAVE ATTACHMENT ID RESULT :', JSON.stringify(obj));
            if (obj.attachment_id !== null) {
                console.log('---> message', JSON.stringify(message));
            }
        }
    });
}

function save_uploaded_attachmentid(attachment_id, page_id, recipientId, message, token) {
    var url = 'http://halfcup.com/social_rebates_system/apix/save_messenger_attachment_id?page_id=' + page_id
        + '&url=' + message.attachment.payload.url
        + '&type=' + message.attachment.type
        + '&attachment_id=' + attachment_id;
    console.log('# SAVE ATTACHMENT ID url', url);
    request({
        url: url,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            hideLoading(token, recipientId);
            console.log('Error : ', error);
        } else if (response.body.error) {
            hideLoading(token, recipientId);
            console.log('Error: ', response.body.error);
        } else {
            var obj = JSON.parse(body);
            console.log('==> SAVE ATTACHMENT ID RESULT :', JSON.stringify(obj));
            if (obj.attachment_id !== null) {
                message.attachment.payload = {attachment_id: obj.attachment_id};
                console.log('---> message', JSON.stringify(message));
                sendMessage(page_id, recipientId, message, token);
            }
        }
    });
}

function upload_attachement(page_id, recipientId, message, token) {
    var url = 'https://graph.facebook.com/v2.8/me/message_attachments?access_token=' + token;
    console.log('# SAVE ATTACHMENT ID url', url);
    console.log('# message ', JSON.stringify(message));
    request({
        url: url,
        method: 'POST',
        json: {
            message: message,
        }
    }, function (error, response, body) {
        if (error) {
            update_webhook_status(page_id, "Error: " + error);
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            update_webhook_status(page_id, "Error: " + response.body.error);
            console.log('Error: ', response.body.error);
        } else {
            // var obj = JSON.parse(body);
            console.log('==> UPLOAD ATTACHMENT RESULT :', JSON.stringify(body));
            save_uploaded_attachmentid(body.attachment_id, page_id, recipientId, message, token);
        }
    });
}

function update_webhook_status(page_id, status) {
    // http://localhost:8080/social_rebates_system/wapi/delete?token=1234567890&api_name=AI_PREV_KEYS_CLEAR&page_id=111
    // var url = 'http://halfcup.com/social_rebates_system/messengerPage/update_webhook_status?page_id=' + page_id + '&status=' + status;
    // console.log('url', url);
    // request({
    //         url: url,
    //         method: 'GET'
    //     }, function (error, response, body) {
    //         if (error) {
    //             console.log('Error : ', error);
    //         } else if (response.body.error) {
    //             console.log('Error: ', response.body.error);
    //         } else {
    //             console.log('Update Webhook Status ', "OK, page: " + page_id + ", status:" + status);
    //         }
    //     }
    // );
}


//========##### TRACKING API ######## ------------------
function start_tracking(aggregation, messenger_id, email) {
    // AGGREGATION_object=xxx_main&query=agent_id=[agent_id]||project_id=[project_id]
    //AGGREGATION_object=unified_button_main&query=project_id=52||agent_id=137||bot_index=0
    var agg_data = aggregation.split('=');
    var agg_obj = agg_data[1].split('&')[0];
    var data_ = aggregation.split('&')[1].replace('query=', '');
    var data_agent = data_.split('||');
    var project_id = null;
    var agent_id = null;
    for (var i = 0; i < data_agent.length; i++) {
        if (data_agent[i].includes('project_id')) {
            project_id = data_agent[i].split('=')[1];
        }
        if (data_agent[i].includes('agent_id')) {
            agent_id = data_agent[i].split('=')[1];
        }
    }

    if (agent_id !== null) {
        var url = 'http://aileadsbooster.com/Backend/start_tracking?aggregation=' + agg_obj
            + '&agent_id=' + agent_id
            + '&project_id=' + project_id
            + '&email=' + email;
        console.log('# c url', url);
        var aggr = JSON.stringify(aggregation);
        console.log('# aggregation ', aggr);
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
                console.log('==> START TRACKING RESULT :', JSON.stringify(obj));
                save_tracking_id(agg_obj, messenger_id, obj.tracking_id);
            }
        });
    }

}

function register_tracking(tracking_id, message) {
    var url = 'http://aileadsbooster.com/Backend/register_message_tracking?tracking_id=' + tracking_id
        + '&message=' + message;
    console.log('# REGISTER TRACKING url', url);
    request({
        url: url,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            console.log('==> REGISTER TRACKING RESULT :', JSON.stringify(body));
        }
    });
}

function register_tracking_phone(tracking_id, phone) {
    var url = 'http://aileadsbooster.com/Backend/register_phone_tracking?tracking_id=' + tracking_id
        + '&phone=' + phone;
    console.log('# REGISTER TRACKING url', url);
    request({
        url: url,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            console.log('==> REGISTER TRACKING RESULT :', JSON.stringify(body));
        }
    });
}


function get_tracking_id(aggregation, messenger_id, textOrPhone, isPhone) {
    var agg_obj = "";
    if (aggregation) {
        var agg_data = aggregation.split('=');
        agg_obj = agg_data[1].split('&')[0];
    }

    var url = 'http://halfcup.com/social_rebates_system/apix/get_tracking_id?aggregation=' + agg_obj
        + '&messenger_id=' + messenger_id;
    console.log('# GET TRACKING ID url', url);
    console.log('# aggregation ', JSON.stringify(aggregation));
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
            console.log('==> GET TRACKING ID RESULT :', JSON.stringify(obj));
            if (obj.data !== null) {
                if (isPhone) {
                    register_tracking_phone(obj.data.tracking_id, textOrPhone);
                } else {
                    register_tracking(obj.data.tracking_id, textOrPhone);
                }

            }
        }
    });
}

function check_tracking_id(aggregation, messenger_id, token) {
    var agg_data = aggregation.split('=');
    var agg_obj = agg_data[1].split('&')[0];
    var url = 'http://halfcup.com/social_rebates_system/apix/get_tracking_id?aggregation=' + aggregation
        + '&messenger_id=' + messenger_id;
    console.log('# CHECK TRACKING ID url', url);
    console.log('# aggregation ', JSON.stringify(aggregation));
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
            console.log('==> CHECK TRACKING ID RESULT :', JSON.stringify(obj));
            if (obj.data === null) {
                get_profile_user(aggregation, messenger_id, token);
            }
        }
    });
}

function save_tracking_id(aggregation, messenger_id, tracking_id) {
    var url = 'http://halfcup.com/social_rebates_system/apix/save_tracking_id?aggregation=' + aggregation
        + '&messenger_id=' + messenger_id + '&tracking_id=' + tracking_id;
    console.log('# SAVE TRACKING ID url', url);
    console.log('# aggregation ', JSON.stringify(aggregation));
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
            console.log('==> SAVE TRACKING ID RESULT :', JSON.stringify(obj));
        }
    });
}

function get_profile_user(aggregation, messenger_id, token) {
    var url = 'https://graph.facebook.com/v2.6/' + messenger_id + '?fields=first_name,last_name,profile_pic&access_token=' + token;
    console.log('==> GET PROFILE USER url:', url);
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
            console.log('==> GET PROFILE USER RESULT :', JSON.stringify(obj));
            var name = obj.first_name + ' ' + obj.last_name;
            start_tracking(aggregation, messenger_id, name);
        }
    });
}