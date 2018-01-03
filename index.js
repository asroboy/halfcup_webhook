var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var Analytics = require('analytics-node');
var analytics = new Analytics('kngf8THjj5e2QnLTdjfprebBW1KdQQbx');

var nlp = require('./nlp');
var new_nlp = require('./new_nlp');
var test = require('./test');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));


// Facebook Webhook
app.get('/webhook', function (req, res) {
    // console.log('res', res);

    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === 'testbot_verify_token') {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// Facebook Webhook
app.get('/nlp', function (req, res) {
    nlp.foo(res)
});

app.get('/new_nlp', function (req, res) {
    new_nlp.foo(res)
});

// Facebook Webhook
app.get('/test', function (req, res) {
    test.foo(res)
});

// handler receiving messages
app.post('/webhook', function (req, res) {
        var events = req.body.entry[0].messaging;
        var changes = req.body.entry[0].changes;
        console.log("POST WEBHOOK");
        console.log("REQ", JSON.stringify(req.body));
        if (changes) {
            var field = req.body.entry[0].changes[0].field;
            if (field == "leadgen") {
                var value = req.body.entry[0].changes[0].value;

                console.log("leadgen value " + value);
                var adId = value.ad_id;
                var formId = value.form_id;
                var leadgenId = value.leadgen_id;
                var createdTime = value.created_time;
                var pageId = value.page_id;
                var adGroupId = value.adgroup_id;
                //U Mobile Club Test.. My msgr Id 1588367541205490
                // var adminMessengerId = "1588367541205490";
                // if (pageId == 444444444444)
                // var pageId = 228431964255924;

                var message = "New lead recieved :" +
                    "\n=====================\n" + "ADS ID : " + adId + "\nAD GROUP ID : " + adGroupId;

                var emailMessage = "New lead recieved :" +
                    "<br> ===================== <br>" + "ADS ID : " + adId + " <br>AD GROUP ID : " + adGroupId;
                getPageIdForLead(pageId, message, leadgenId, formId, emailMessage);
            }
        }

        if (events) {
            for (i = 0; i < events.length; i++) {
                var event = events[i];
                console.log("=======EVENT CHECK=======");
                //console.log('Sender ID: ', event.sender.id);
                console.log('Event ' + i + ': ', JSON.stringify(event));
                var hc_token = 'EAABqJD84pmIBABjewVhyAuMwDLFaI7YT7fsJLzeh63mhOwdZAgMKClvFfZBvHhFR35dIok3YQAxeZCuDbiLCaWVOpQxWVRHZBahsQOy9ZCTn4e4wdWcZA0VmGU6x0CFzv6dRcCzrlSZA87EPcI3b0KCDkedjLc37lZCvnu47iTTAwgZDZD';


                if (event.referral) {
                    console.log('messaging');
                    // var messaging = event.messaging[0];
                    // if(messaging.hasOwnProperty('referral')){
                    //     console.log('messaging.referral');
                    //     var referral = messaging.referral;
                    if (event.referral.hasOwnProperty('ref')) {
                        console.log('event.referral.ref');
                        console.log(event.referral.ref);
                        if (event.referral.ref !== null) {
                            if (event.referral.ref.indexOf("DONE_BOT") > -1 && event.referral.ref.indexOf('|param|') > -1) {
                                if (event.referral.ref.indexOf('|param|') > -1) {
                                    var code = event.referral.ref.split('\|param\|')[1];

                                    // clearAiKey(event.recipient.id);
                                    // saveParamAi(event.recipient.id, event.sender.id, '', code);
                                    new_nlp.getChatBot(event.referral.ref, event.recipient.id, event.sender.id, res);
                                }
                            }
                            else if (event.referral.ref.indexOf('|param|') > -1) {
                                clearAiKey(event.recipient.id);
                                var code = event.referral.ref.split('\|param\|')[1];
                                var text = event.referral.ref.split('\|param\|')[0];
                                console.log("code ", code);
                                console.log("text ", text);
                                saveParamAi(event.recipient.id, event.sender.id, '', code)
                                new_nlp.getChatBot(text, event.recipient.id, event.sender.id, res);
                            } else {
                                new_nlp.getChatBot(event.referral.ref, event.recipient.id, event.sender.id, res);
                            }
                        }

                    }
                    // }

                }

                if (event.message) {
                    //NLP Handling
                    if (event.message.nlp) {
                        new_nlp.handleMessage(event, event.message, res);
                        //NON NLP Handling
                    } else {
                        if (event.message) {
                            var msg = event.message.text;
                            if (event.sender.id === '912070908830063') {
                                if (msg === 'Hi, I\'m Halfcup') {
                                    var message = {"text": "I can help you to remind food time at anytime u want"}
                                    sendMessage(event.recipient.id, message, hc_token);
                                }
                                if (msg === 'OK, I will guide you') {
                                    var message = {
                                        "text": 'Do you need me to remind your breakfast time',
                                        "quick_replies": [{
                                            "content_type": "text",
                                            "title": "Yes",
                                            "payload": "DEVELOPER_SETUP_YES"
                                        }, {"content_type": "text", "title": "No", "payload": "DEVELOPER_SETUP_NO"}]
                                    }
                                    sendMessage(event.recipient.id, message, hc_token);
                                }
                            }

                            if (event.recipient.id === '912070908830063') {
                                console.log("=======Reply check 912070908830063=======");
                                if (msg === 'Hi' || msg === 'hi' || msg === 'hallo' || msg === 'halo' || msg === 'Hallo') {
                                    var message = {
                                        "text": 'Hi, are you ready to setup your remider',
                                        "quick_replies": [{
                                            "content_type": "text",
                                            "title": "Setup",
                                            "payload": "DEVELOPER_SETUP"
                                        }]
                                    }
                                    sendMessage(event.sender.id, message, hc_token);
                                }

                                if (msg === 'setup' || msg === 'Setup') {

                                    var message = {
                                        "text": 'OK, do you need me to remind your breakfast time',
                                        "quick_replies": [{
                                            "content_type": "text",
                                            "title": "Yes",
                                            "payload": "DEVELOPER_SETUP_YES"
                                        }, {"content_type": "text", "title": "No", "payload": "DEVELOPER_SETUP_NO"}]
                                    }
                                    sendMessage(event.sender.id, message, hc_token);
                                }

                                if (msg.indexOf('start') !== -1 || msg.indexOf('Start') !== -1) {

                                }

                                if ((msg.indexOf('How') !== -1 || msg.indexOf('how') !== -1) && (msg.indexOf('do') !== -1 || msg.indexOf('Do') !== -1)) {
                                    var message = {
                                        "text": 'OK, I will guide you'
                                    }
                                    sendMessage(event.sender.id, message, hc_token);
                                }
                                // if(event.message.text !== 'GET_STARTED_PAYLOAD '){
                                //     var message = {"text": "Yeah .. I know u're busy person"}
                                //     sendMessage(event.sender.id, message, hc_token);
                                // }

                            }
                        }

                        if (event.message && event.message.text && event.sender) {
                            //console.log("=======MESSAGE=======");
                            //console.log('Message : ', event.message.text);

                            /**
                             * ACTIONS FOR QUICK REPLY
                             */
                            if (event.message.quick_reply) {
                                console.log("=======QUICK REPLY=======");

                                var find_prefix = event.message.quick_reply.payload.split('_');
                                var payload_prefix = find_prefix[0];
                                console.log("payload_prefix", payload_prefix);

                                console.log("Payload ", event.message.quick_reply.payload);
                                var htmlMessage = "<tr>" +
                                    "<td>Page ID</td>" +
                                    "<td>:</td>" +
                                    " <td>" + event.recipient.id + "</td>" +
                                    "</tr> " +
                                    "<tr>" +
                                    " <td>Recipient ID</td>" +
                                    "<td>:</td>" +
                                    "<td>" + event.sender.id + "</td>" +
                                    " </tr> " +
                                    "<tr>" +
                                    " <td>Payload</td>" +
                                    "<td>:</td>" +
                                    "<td>" + event.message.quick_reply.payload + "</td>" +
                                    " </tr> " +
                                    "<tr>" +
                                    " <td>Quick Reply</td>" +
                                    "<td>:</td>" +
                                    "<td>" + event.message.text + "</td>" +
                                    " </tr> " +
                                    "</table> ";

                                // sendEmail(htmlMessage, event.recipient.id, 'brotherho@halfcup.com');
                                // getParamZ(htmlMessage, event.recipient.id, event.sender.id);

                                /**
                                 * Check if payload REGISTER_PAYLOAD (old Get started) button
                                 */
                                if (event.message.quick_reply.payload === 'REGISTER_PAYLOAD') {

                                    getResponseToUser(event.message.quick_reply.payload, event.sender.id, event.recipient.id);
                                }
                                /**
                                 * Check if payload DEVELOPER (Get started) button
                                 */
                                else if (payload_prefix === 'DEVELOPER') {
                                    console.log("Payload ", event.message.quick_reply.payload);
                                    pixel('QuickReply', event.message.text, event.message.quick_reply.payload, event.sender.id, event.recipient.id);
                                    getResponseToUser(event.message.quick_reply.payload, event.sender.id, event.recipient.id);
                                }

                                else if (payload_prefix === 'CUSTOM') {
                                    console.log('call new_nlp CUSTOM');
                                    new_nlp.getChatBot(event.message.quick_reply.payload, event.recipient.id, event.sender.id, res)
                                }
                                /**
                                 * Check if payload is BOT key
                                 */
                                else if (payload_prefix === 'BOT' || payload_prefix === 'SHARE') {
                                    console.log("Payload ", event.message.quick_reply.payload);
                                    pixel('QuickReply', event.message.text, event.message.quick_reply.payload, event.sender.id, event.recipient.id);
                                    getResponseToUser(event.message.quick_reply.payload, event.sender.id, event.recipient.id);
                                }
                                /**
                                 * Check if payload is Multi BOT key(s)
                                 */
                                else if ((payload_prefix === 'BOT' || payload_prefix === 'SHARE') && event.message.quick_reply.payload.indexOf(",") !== -1) {
                                    var payloads = event.message.quick_reply.payload.split(",");
                                    for (i = 0; i < payloads.length; i++) {
                                        console.log("Payload " + i, payloads[i]);
                                        pixel('QuickReply', event.message.text, payloads[i], event.sender.id, event.recipient.id);
                                        getResponseToUser(payloads[i], event.sender.id, event.recipient.id);
                                    }
                                }
                                /**
                                 * MULTI KEY FORMAT [A]|[B]|BOT_xxxx_xxxx
                                 */
                                else if ((event.message.quick_reply.payload.indexOf("|") > -1) && payload_prefix !== 'AGGREGATION') {
                                    /**
                                     * Split Payload marked with |
                                     * @type {*}
                                     */

                                    if (event.message.quick_reply.payload.indexOf('|param|')) {
                                        var code = event.message.quick_reply.payload.split('\|param\|')[1];
                                        var text = event.message.quick_reply.payload.split('\|param\|')[0];
                                        clearAiKey(event.recipient.id);
                                        saveParamAi(event.recipient.id, event.sender.id, '', code);
                                        new_nlp.getChatBot(text, event.recipient.id, event.sender.id, res);
                                    } else {
                                        var keys = event.message.quick_reply.payload.split("|");
                                        console.log("Payload ", event.message.quick_reply.payload);
                                        var action_name = keys[0];
                                        action_name = action_name.replace("[", "");
                                        action_name = action_name.replace("]", "");


                                        if (keys.length == 2) {
                                            keyIndexAction(keys[1], event, action_name, "QuickReply");
                                        }
                                        if (keys.length == 3) {
                                            keyIndexAction(keys[1], event, action_name, "QuickReply");
                                            keyIndexAction(keys[2], event, action_name, "QuickReply");
                                        }

                                        if (keys.length == 4) {
                                            keyIndexAction(keys[1], event, action_name, "QuickReply");
                                            keyIndexAction(keys[2], event, action_name, "QuickReply");
                                            keyIndexAction(keys[3], event, action_name, "QuickReply");

                                        }
                                    }


                                }

                                //=====
                                /**
                                 * if Payload is only text
                                 */
                                // else if (event.message.quick_reply.payload) {
                                //event.message.quick_reply.payload.indexOf('AGGREGATION_') > -1
                                else if (payload_prefix === 'AGGREGATION') {
                                    new_nlp.getChatBot(event.message.quick_reply.payload, event.recipient.id, event.sender.id, res);
                                } else {
                                    console.log("QuickReply ", event.message.quick_reply.payload);
                                    //var token = "";
                                    //this is to handle print PAYLOAD to msgr room
                                    pixel('QuickReply', event.message.text, event.message.quick_reply.payload, event.sender.id, event.recipient.id);
                                    getToken(event.message.quick_reply.payload, event.recipient.id, event.sender.id, false);
                                }
                                // }
                            }

                            /**
                             * ACTIONS FOR OTHERS
                             */
                            else {
                                if (event.message.metadata) {
                                    var jsonMeta = JSON.parse(event.message.metadata);
                                    console.log('json meta', jsonMeta);
                                    if (jsonMeta.ad_id) {
                                        console.log("=======ADS REPLY=======");
                                        if (event.message.text.indexOf('{{') > -1)
                                            new_nlp.getMerchantId(event.sender.id, event.recipient.id, event.message.text, res);
                                        // getAdsResponseToUser(event.recipient.id, event.sender.id, jsonMeta.ad_id)
                                    }
                                } else {
                                    if (event.message.text) {
                                        var request_key = event.message.text;
                                        new_nlp.getMerchantId(event.recipient.id, event.sender.id, request_key, res);
                                        console.log("===== event.message.text ========");
                                        // getResponseToUser(request_key, event.sender.id, event.recipient.id);
                                    }
                                }
                            }

                        }

                        if (event.message && event.message.attachments) {
                            console.log("===== event.message.text ========");
                            console.log("===== NOTHING HERE ========");
                            //var arr = JSON.parse(event.message.attachments);
                            //getResponseToUser(event.message.attachments[0].payload.sticker_id, event.sender.id, event.recipient.id);
                        }
                    }
                }

                /**
                 * ACTIONS FOR OPTIN
                 */
                if (event.optin) {
                    var key = event.optin.ref;
                    console.log(key)
                    if (key === null) {

                    } else {
                        if (event.optin.user_ref) {
                            console.log(key)
                            // getResponseToUserRef(key, event.optin.user_ref, event.recipient.id);
                        } else if (key.indexOf("{{") > -1) {
                            clearAiKey(event.recipient.id);
                            new_nlp.getChatBot(key, event.recipient.id, event.sender.id, res);
                        } else if (key === 'null') {

                        } else {

                        }
                    }

                }

                /**
                 * ACTIONS FOR POSTBACK
                 */
                if (event.hasOwnProperty('postback')) {
                    if (event.postback.hasOwnProperty('payload')) {
                        console.log("===== event.postback.payload ========");
                        if (event.postback.payload.indexOf('|param|') > -1) {
                            var ref = event.postback.payload.replace("http://halfcup.com/social_rebates_system/app/msgredir?", "");
                            ref = ref.split("ref=")[1];
                            if (ref.indexOf("{{") > -1) {
                                // new_nlp.getChatBot(ref, event.recipient.id, event.sender.id, res);

                                if (ref.indexOf('|param|') > -1) {
                                    var code = ref.split('\|param\|')[1];
                                    var text = ref.split('\|param\|')[0];
                                    clearAiKey(event.recipient.id);
                                    saveParamAi(event.recipient.id, event.sender.id, '', code);
                                    new_nlp.getChatBot(text, event.recipient.id, event.sender.id, res);
                                } else {
                                    new_nlp.getChatBot(ref, event.recipient.id, event.sender.id, res);
                                }

                            } else if (ref === 'null') {

                            } else if (ref.indexOf("DONE_BOT") > -1) {
                                if (ref.indexOf('|param|') > -1) {
                                    var code = ref.split('\|param\|')[1];

                                    // clearAiKey(event.recipient.id);
                                    // saveParamAi(event.recipient.id, event.sender.id, '', code);
                                    new_nlp.getChatBot(ref, event.recipient.id, event.sender.id, res);
                                }
                            } else {
                                var keys = ref.split("|");

                                // if (keys[0] === 'MESSAGE_ME') {
                                // getResponseToUser(ref,event.sender.id, event.recipient.id );
                                getToken(ref, event.recipient.id, event.sender.id, true);
                                // }
                            }
                        } else {


                            var find_prefix = event.postback.payload.split('_');
                            var payload_prefix = find_prefix[0];

                            var htmlMessage = "<tr>" +
                                "<td>Page ID</td>" +
                                "<td>:</td>" +
                                " <td>" + event.recipient.id + "</td>" +
                                "</tr> " +
                                "<tr>" +
                                " <td>Recipient ID</td>" +
                                "<td>:</td>" +
                                "<td>" + event.sender.id + "</td>" +
                                " </tr> " +
                                "<tr>" +
                                " <td>Payload</td>" +
                                "<td>:</td>" +
                                "<td>" + event.postback.payload + "</td>" +
                                " </tr> " +
                                "<tr>" +
                                " <td>Event type</td>" +
                                "<td>:</td>" +
                                "<td>Postback</td>" +
                                " </tr> " +
                                "<tr>" +
                                " <td>Title</td>" +
                                "<td>:</td>" +
                                "<td>" + event.postback.title + "</td>" +
                                " </tr> " +
                                "</table> ";

                            // sendEmail(htmlMessage, event.recipient.id, 'brotherho@halfcup.com');
                            // getParamZ(htmlMessage, event.recipient.id, event.sender.id);
                            // console.log("Index of , " + event.postback.payload.indexOf(","));
                            if ((payload_prefix === 'BOT' || payload_prefix === 'SHARE') && (event.postback.payload.indexOf(",") > -1)) {
                                var payloads = event.postback.payload.split(",");
                                for (i = 0; i < payloads.length; i++) {
                                    console.log("Payload " + i, payloads[i]);
                                    pixel('PostBack', payloads[i], payloads[i], event.sender.id, event.recipient.id);
                                    getResponseToUser(payloads[i], event.sender.id, event.recipient.id);
                                }
                            } else if ((event.postback.payload.indexOf("|") > -1) && payload_prefix !== 'AGGREGATION') {
                                if (event.postback.payload.indexOf('|param|')) {
                                    var code = event.postback.payload.split('\|param\|')[1];
                                    var text = event.postback.payload.split('\|param\|')[0];
                                    clearAiKey(event.recipient.id);
                                    saveParamAi(event.recipient.id, event.sender.id, '', code);
                                    new_nlp.getChatBot(text, event.recipient.id, event.sender.id, res);
                                }

                            } else if (payload_prefix === 'AGGREGATION') {
                                console.log('call new_nlp AGGREGATION');
                                new_nlp.getChatBot(event.postback.payload, event.recipient.id, event.sender.id, res)
                            }

                            else if (payload_prefix === 'LIVE') {
                                console.log('call new_nlp LIVE');
                                new_nlp.getChatBot(event.postback.payload, event.recipient.id, event.sender.id, res)
                            }

                            else if (payload_prefix === 'CUSTOM') {
                                console.log('call new_nlp CUSTOM');
                                new_nlp.getChatBot(event.postback.payload, event.recipient.id, event.sender.id, res)
                            }

                            /**
                             * MULTI KEY FORMAT [A]|[B]|BOT_xxxx_xxxx
                             * MULTI KEY FORMAT [A]|[B]|[BOT_xxxx_xxxx]|BOT_xxx_xxx
                             */
                            else if (event.postback.payload.indexOf("|") > -1) {
                                /**
                                 * Split Payload marked with |
                                 * @type {*}
                                 */
                                var keys = event.postback.payload.split("|");
                                console.log("Payload ", event.postback.payload);
                                console.log("PAYLOAD KEY SIZE ", keys.length);

                                var action_name = keys[0]; //action name
                                action_name = action_name.replace("[", "");
                                action_name = action_name.replace("]", "");

                                if (keys.length == 2) {
                                    keyIndexAction(keys[1], event, action_name, "PostBack");
                                }
                                if (keys.length == 3) {
                                    keyIndexAction(keys[1], event, action_name, "PostBack");
                                    keyIndexAction(keys[2], event, action_name, "PostBack");
                                }

                                if (keys.length == 4) {
                                    keyIndexAction(keys[1], event, action_name, "PostBack");
                                    keyIndexAction(keys[2], event, action_name, "PostBack");
                                    keyIndexAction(keys[3], event, action_name, "PostBack");
                                    // index_1_action(action_name, reply_text_or_bot_key, keys[2], "PostBack", event);
                                }

                            }

                            //***************
                            else if (event.postback.payload === "USER_DEFINED_PAYLOAD") {
                                pixel('PostBack', "Get Started", event.postback.payload, event.sender.id, event.recipient.id);
                                getResponseToUser(event.postback.payload, event.sender.id, event.recipient.id);
                            } else if (event.postback.payload.indexOf("{{") > -1) {
                                console.log('call new_nlp event.postback.payload {{');
                                new_nlp.getChatBot(event.postback.payload, event.recipient.id, event.sender.id, res);
                            } else {
                                pixel('PostBack', event.postback.payload, event.postback.payload, event.sender.id, event.recipient.id);
                                getResponseToUserForPostback(event.postback.payload, event.sender.id, event.recipient.id);
                            }
                        }

                    }

                    if (event.postback.hasOwnProperty('referral')) {
                        var ref = event.postback.referral.ref;
                        console.log("event.postback.referral.ref");
                        if (ref === null) {

                        } else {
                            if (ref.indexOf("{{") > -1) {
                                // new_nlp.getChatBot(ref, event.recipient.id, event.sender.id, res);

                                if (ref.indexOf('|param|') > -1) {
                                    var code = ref.split('\|param\|')[1];
                                    var text = ref.split('\|param\|')[0];
                                    clearAiKey(event.recipient.id);
                                    saveParamAi(event.recipient.id, event.sender.id, '', code);
                                    new_nlp.getChatBot(text, event.recipient.id, event.sender.id, res);
                                } else {
                                    new_nlp.getChatBot(ref, event.recipient.id, event.sender.id, res);
                                }

                            } else if (ref === 'null') {

                            } else if (ref.indexOf("DONE_BOT") > -1) {
                                if (ref.indexOf('|param|') > -1) {
                                    var code = ref.split('\|param\|')[1];

                                    // clearAiKey(event.recipient.id);
                                    // saveParamAi(event.recipient.id, event.sender.id, '', code);
                                    new_nlp.getChatBot(ref, event.recipient.id, event.sender.id, res);
                                }
                            } else {
                                var keys = ref.split("|");

                                // if (keys[0] === 'MESSAGE_ME') {
                                // getResponseToUser(ref,event.sender.id, event.recipient.id );
                                getToken(ref, event.recipient.id, event.sender.id, true);
                                // }
                            }

                        }

                    }
                }
            }

        }

        res.sendStatus(200);
    }
);

function saveMessengerAdmin(sender, recipient) {
    var url = 'http://halfcup.com/social_rebates_system/api/saveAdminMessengerId?page_id=' + recipient + '&admin_msg_id=' + sender + "&token=1234567890";
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
                // var obj = JSON.parse(body);
                console.log('response : ', body);
            }
        }
    );
}

function keyIndexAction(key, event, action_name, event_name) {
    // var key_1 = keys[1]; //reply text or maybe bot key  INDEX 1
    if (key.indexOf("]") > -1) {

        key = key.replace("[", "");
        key = key.replace("]", "");
        var reply_text = key;
        if (reply_text.indexOf("_") > -1) {
            var prefix = reply_text.split('_');
            var p_prefix = prefix[0];
            if ((p_prefix === 'BOT' || p_prefix === 'SHARE') && reply_text.indexOf(",") > -1) {
                var payloads = reply_text.split(",");
                for (i = 0; i < payloads.length; i++) {
                    console.log("Payload " + i, payloads[i]);
                    pixel(event_name, action_name, payloads[i], event.sender.id, event.recipient.id);
                    if (event_name === "PostBack") {
                        getResponseToUserForPostback(payloads[i], event.sender.id, event.recipient.id);
                    } else {
                        var resp = getResponseToUser(payloads[i], event.sender.id, event.recipient.id);
                        console.log("GET RESPONSE TO USER : ", resp);
                    }
                }
            } else {
                pixel(event_name, action_name, reply_text, event.sender.id, event.recipient.id);
                if (event_name === "PostBack") {
                    getResponseToUserForPostback(reply_text, event.sender.id, event.recipient.id);
                } else {
                    getResponseToUser(reply_text, event.sender.id, event.recipient.id);

                }
            }
        } else if (reply_text.indexOf('{{') > -1) {
            reply_text = reply_text.replace('{{', "")
            reply_text = reply_text.replace('}}', "")
            new_nlp.getChatBot(reply_text, event.recipient.id, event.sender.id, res);
        } else {
            if (reply_text !== "") {
                getToken(reply_text, event.recipient.id, event.sender.id, false);
            }
        }

    } else {
        if (key.indexOf("_") > -1) {
            var prefix = key.split('_');
            var p_prefix = prefix[0];
            if ((p_prefix === 'BOT' || p_prefix === 'SHARE') && key.indexOf(",") > -1) {
                var payloads = key.split(",");
                for (i = 0; i < payloads.length; i++) {
                    console.log("Payload " + i, payloads[i]);
                    pixel(event_name, action_name, payloads[i], event.sender.id, event.recipient.id);
                    if (event_name === "PostBack") {
                        getResponseToUserForPostback(payloads[i], event.sender.id, event.recipient.id);
                    } else {
                        getResponseToUser(payloads[i], event.sender.id, event.recipient.id);
                    }
                }
            } else if ((p_prefix === 'BOT' || p_prefix === 'SHARE')) {
                pixel(event_name, action_name, key, event.sender.id, event.recipient.id);
                if (event_name === "PostBack") {
                    getResponseToUserForPostback(key, event.sender.id, event.recipient.id);
                } else {
                    var resp = getResponseToUser(key, event.sender.id, event.recipient.id);
                    console.log("GET RESPONSE TO USER : ", resp);
                }
            }
        } else if (key.indexOf('{{') > -1) {
            key = key.replace('{{', "")
            key = key.replace('}}', "")
            new_nlp.getChatBot(key, event.recipient.id, event.sender.id, res);
        } else {
            if (key !== "") {
                getToken(key, event.recipient.id, event.sender.id, false);
            }

        }
    }
}

function validateSamples(key) {
    request({
        url: 'https://api.wit.ai/samples?v=20170307&q=' + key,
        method: 'GET',
        headers: {
            Authorization: `Bearer VYDNMLAK5Z74PEDNVJXCOKU7SROGOJIU`,
            'Content-Type': 'application/json',
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
            result = "error";
            return result;
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
            result = "error";
            return result;
        } else {
            console.log(body);
            result = "oke";
            return result;
        }
    });
}

app.get('/callback', function (req, res) {
    if (req.query['token'] === 'test') {
        res.send('OKE');
    } else {
        res.send('Invalid verify token');
    }
});

app.get('/test', function (req, res) {
    if (req.query['token'] === 'test') {
        helooTest(callback());
        res.send('HALOOO');
    } else {
        res.send('Invalid verify token');
    }
});

function looper() {
    var z = 0;
    while (helooTest(callback()) !== "" && z < 10) {
        z++;
        console.log("oke " + z);
    }
}

function callback() {
    console.log("callback");
}

function helooTest(callback) {
    var url = 'http://localhost:3000/callback?token=test';
    console.log('url', url);
    var result = "";
    request({
        url: url,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
            result = "error";
            return result;
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
            result = "error";
            return result;
        } else {
            result = "oke";
            return result;
        }
    });

}

function pixel(event_name, name, key, messenger_id, page_id) {
    var url = 'http://halfcup.com/social_rebates_system/pixel/index?name=' + name + '&event_name=' + event_name + '&key=' + key + '&messenger_id=' + messenger_id + '&page_id=' + page_id;

    analytics.track({
        userId: 'f4ca124298',
        event: event_name,
        properties: {
            name: name,
            key: key,
            messenger_id: messenger_id,
            page_id: page_id
        }
    });

    console.log('url_pixel', url);
    request({
        url: url,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            console.log('PIXEL', 'Successfully send');
            // console.log('PIXEL', body);
        }
    });
    logAction(event_name, name, key, messenger_id, page_id);
}

function logAction(event_name, name, key, messenger_id, page_id) {
    var url = 'http://halfcup.com/social_rebates_system/hcApi/saveMessengerAction?messenger_id=' + page_id + '&action_name=' + name + '&payload=' + key + '&user_msg_id=' + messenger_id;

    console.log('url user action', url);
    request({
        url: url,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            console.log('USER ACTION', 'Successfully send');
            // console.log('PIXEL', body);
        }
    });
}

function getUserInfo(user_msg_id, page_token) {
    var url = 'https://graph.facebook.com/v2.6/' + user_msg_id + '?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=' + page_token;
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
                sendMessage(recipient, message, token);
            }
            if (code == 0) {
                console.log('TOKEN NOT FOUND, Get page access token from facebook developer page and register to http://halfcup.com/social_rebates_system');
            }
        }
    });
}

function getPageIdForLead(pageId, message, leadgenId, formId, emailMessage) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/read?api_name=LEAD_FORM_PAGE_ID&page_id=' + pageId + '&token=1234567890&lead_form_id=' + formId;
    console.log('url', url);

    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending message for sender ' + pageId + ': ', error);
            } else if (response.body.error) {
                console.log('Error for sender ' + pageId + ': ', response.body.error);
            } else {
                var obj = JSON.parse(body);
                console.log('json: ', obj);
                var code = obj.code;
                if (code == 1) {
                    getPageAccessTokenForLead(obj.pageId, message, leadgenId, emailMessage)
                }
                if (code == 0) {
                    console.log('TOKEN NOT FOUND');
                    return "";
                }

            }
        }
    );
}


function getPageAccessTokenForLead(sender, message, leadgenId, emailMessage) {
    var url = 'http://halfcup.com/social_rebates_system/api/getPageMessengerToken?messenger_id=' + sender;
    console.log('url', url);

    request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending message for sender ' + sender + ' and recipient ' + recipientId + ' and leadgenId ' + leadgenId + ': ', error);
            } else if (response.body.error) {
                console.log('Error for sender ' + sender + ' and recipient ' + recipientId + ' and leadgenId ' + leadgenId + ': ', response.body.error);
            } else {
                var obj = JSON.parse(body);
                console.log('json: ', obj);
                var code = obj.code;
                if (code == 1) {
                    var token = obj.messenger_data.pageAccessToken;
                    var recipientId = obj.messenger_data.adminMessengerId;
                    // var longLiveToken = "EAABqJD84pmIBAP4xtPj3NTLfCzWp17iZByoFndpbnEq79ZAOGs7XdF5YMO5i1GgQ3zHex200f2uvLHWqzFxRk0RrC1jV7RZBZAqtU2mLluefhmexnX7SSnTP63Hy2x3AAvv5FgkU48FE95fpj7c8ZBREHJIVBYg4ZD";
                    var longLiveToken = "EAABqJD84pmIBAP6U37LseOrNLP6Xt13zCRR8dUCcNS4T1tKFQd8JZAyGQJOPq4mOfHazyppWRGYQaO2aaT1vQA4HNSEu10D6CgH220ND9ecweec3WOMGsvbIMv1gzJI5NrYXRKf5Nqmc8o9cfJdG9eBeU1UZBuOK2iSZCBlogZDZD";
                    var urlGetLead = "https://graph.facebook.com/v2.9/" + leadgenId + "?access_token=" + longLiveToken;
                    console.log("LEAD URL " + urlGetLead);
                    getLead(urlGetLead, token, message, recipientId, sender, emailMessage)
                    return token;

                }
                if (code == 0) {
                    console.log('TOKEN NOT FOUND');
                    return "";
                }

            }
        }
    );
}


function getLead(url, token, message, recipientId, sender, emailMessage) {
    console.log("get lead url : " + url);
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
                console.log('json: ', obj);
                if (!obj.error) {
                    var createdTime = obj.created_time
                    if (createdTime) {
                        createdTime = createdTime.replace(/T/, ' ').replace(/\..+/, '');
                    }
                    var id = obj.id;
                    var field_data = obj.field_data;
                    var mData = "";
                    var emailData = "";

                    for (var i = 0; i < field_data.length; i++) {
                        mData = mData + field_data[i].name + ": " + field_data[i].values + "\n";
                        emailData = emailData + field_data[i].name + ": " + field_data[i].values + "<br>";
                    }


                    message = message + "id : " + id
                        + "\ntime : " + createdTime +
                        "\n" + mData;

                    emailMessage = emailMessage + "<br>id : " + id + "<br>time : " + createdTime + "<br>" + emailData;

                    var msg = {"text": message};
                    console.log("LEAD FROM RECIEVED ==== >" + message);

                    var js_ = JSON.stringify(msg);
                    var myEscapedJSONString = js_.escapeSpecialChars();
                    myEscapedJSONString = myEscapedJSONString.replace(/\\\\n/g, "\\n");
                    console.log("TEXT ==> " + myEscapedJSONString);
                    sendMessage(recipientId, msg, token);


                    sendEmailForLead(emailMessage, sender)
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
                    // if (m_payload.indexOf("\n") > -1) {
                    //     var msgs = m_payload.split("\n");
                    //     for (i = 0; i < msgs.length; i++) {
                    //         // var m = msgs[i].replace(/\n/g, "\\\\n")
                    //         var message = {"text": msgs[i]};
                    //         var js_ = JSON.stringify(message);
                    //         var myEscapedJSONString = js_.escapeSpecialChars();
                    //         myEscapedJSONString = myEscapedJSONString.replace(/\\\\n/g, "\\n");
                    //         console.log("TEXT ==> " + myEscapedJSONString);
                    //         sendMessage(recipient, myEscapedJSONString, token);
                    //     }
                    // } else {

                    // m_payload.replace(/\n/g, "\\\\n");
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
                    // }

                }
                if (code == 0) {
                    console.log('Can\'t send message, TOKEN NOT FOUND, Get page access token from facebook developer page and register to http://halfcup.com/social_rebates_system');
                }

            }
        }
    );
}

function getAdsResponseToUser(recipient, sender, ads_id) {

    var result = "";
    var url = 'http://halfcup.com/social_rebates_system/api/getBotAdsResponseMessage?messenger_id=' + sender + '&ads_id=' + ads_id + '&messenger_uid=' + recipient;
    console.log('url', url);
    request({
        url: url,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
            result = 'Error sending message: ' + error;
            return result;
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            var obj = JSON.parse(body);
            console.log('json: ', obj);
            var code = obj.code;
            if (code == 1) {
                var token = obj.messenger_data.pageAccessToken;
                result = sendMessage(recipient, obj.data.jsonData, token);
                return result;
            }
            if (code == 0) {
                var token = obj.messenger_data.pageAccessToken;
                //sendMessage(recipient, {"text" : "Sorry I don't understand what do you want"}, token);
                result = JSON.stringify(response);
                return result;
            }

        }
    });
}

function getResponseToUser(request_key, recipient, sender) {
    var result = "";
    var url = 'http://halfcup.com/social_rebates_system/api/getResponseMessage?messenger_id=' + sender + '&request_key=' + request_key + '&messenger_uid=' + recipient;
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
                // var json_data = obj.data.jsonData.replace(/\n/g, "\\\\n");
                var myEscapedJSONString = obj.data.jsonData.escapeSpecialChars();
                myEscapedJSONString = myEscapedJSONString.replace(/\\\\n/g, "\\n");
                console.log('jsonData: ', myEscapedJSONString);
                result = sendMessage(recipient, myEscapedJSONString, token);
                return result;
            }
            if (code == 0) {
                getResponseToUserWithNoKey(recipient, sender);
            }

        }
    });
}

function sendEmail(message, page_id, email) {
    var longLiveToken = "EAABqJD84pmIBAP6U37LseOrNLP6Xt13zCRR8dUCcNS4T1tKFQd8JZAyGQJOPq4mOfHazyppWRGYQaO2aaT1vQA4HNSEu10D6CgH220ND9ecweec3WOMGsvbIMv1gzJI5NrYXRKf5Nqmc8o9cfJdG9eBeU1UZBuOK2iSZCBlogZDZD";
    var graphUrl = "https://graph.facebook.com/v2.10/" + page_id + "?access_token=" + longLiveToken;
    request({
        url: graphUrl,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            console.log('BODY ', body);
            var result = "Messenger message coming in<br/><br/>" +
                "<table>" +
                "<tr>" +
                " <td>PAGE</td>" +
                "<td>:</td>" +
                "<td>" + JSON.parse(body).name + "</td>" +
                " </tr> ";
            message = result + message;
            //brotherho@halfcup.com

            var url = 'http://halfcup.com/social_rebates_system/api/sendEmail?' +
                'sender=noreply@halfcup.com' +
                '&receiver=' + email +
                '&subject=MESSENGER FACEBOOK ' + JSON.parse(body).name +
                '&body=' + message;
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
                    console.log('Send email ', "OK");
                }
            });
        }
    });
}

function sendEmailForLead(message, page_id) {
    var longLiveToken = "EAABqJD84pmIBAP6U37LseOrNLP6Xt13zCRR8dUCcNS4T1tKFQd8JZAyGQJOPq4mOfHazyppWRGYQaO2aaT1vQA4HNSEu10D6CgH220ND9ecweec3WOMGsvbIMv1gzJI5NrYXRKf5Nqmc8o9cfJdG9eBeU1UZBuOK2iSZCBlogZDZD";
    var graphUrl = "https://graph.facebook.com/v2.10/" + page_id + "?access_token=" + longLiveToken;
    request({
        url: graphUrl,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            console.log('BODY ', body);
            // var result = "Messenger message coming in<br/><br/>" +
            //     "<table>" +
            //     "<tr>" +
            //     " <td>PAGE</td>" +
            //     "<td>:</td>" +
            //     "<td>" + JSON.parse(body).name + "</td>" +
            //     " </tr> ";

            message = "<b>PAGE : " + JSON.parse(body).name + "</b> <br/><br/> " + message;
            //brotherho@halfcup.com
            //asrofiridho@gmail.com

            var url = 'http://halfcup.com/social_rebates_system/api/sendEmail?' +
                'sender=noreply@halfcup.com' +
                '&receiver=brotherho@halfcup.com' +
                '&subject=NEW LEAD RECIEVED : ' + JSON.parse(body).name +
                '&body=' + message;
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
                    console.log('Send email ', "OK");
                }
            });
        }
    });


}

function getResponseToUserForPostback(request_key, recipient, sender) {

    var url = 'http://halfcup.com/social_rebates_system/api/getResponseMessage?messenger_id=' + sender + '&request_key=' + request_key + '&messenger_uid=' + recipient;
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
                // var js_ = JSON.stringify(obj.data.jsonData);
                var myEscapedJSONString = obj.data.jsonData.escapeSpecialChars();
                myEscapedJSONString = myEscapedJSONString.replace(/\\\\n/g, "\\n");
                console.log('jsonData: ', myEscapedJSONString);
                sendMessage(recipient, myEscapedJSONString, token);
            }
            if (code == 0) {
                var token = obj.messenger_data.pageAccessToken;
                // getResponseToUserWithNoKey(recipient, sender);
                // if (!(request_key.indexOf("BOT") > -1) && !(request_key.indexOf("USER_DEFINED_PAYLOAD") > -1)) {
                if (request_key.indexOf("_") > -1) {
                    var prefix = request_key.split('_');
                    var p_prefix = prefix[0];
                    if (p_prefix !== 'BOT' && p_prefix !== 'SHARE') {
                        var message = {"text": request_key};
                        var js_ = JSON.stringify(message);
                        var myEscapedJSONString = js_.escapeSpecialChars();
                        myEscapedJSONString = myEscapedJSONString.replace(/\\\\n/g, "\\n");
                        console.log("TEXT ==> " + myEscapedJSONString);
                        sendMessage(recipient, myEscapedJSONString, token);
                    }
                } else {
                    var message = {"text": request_key};
                    var js_ = JSON.stringify(message);
                    var myEscapedJSONString = js_.escapeSpecialChars();
                    myEscapedJSONString = myEscapedJSONString.replace(/\\\\n/g, "\\n");
                    console.log("TEXT ==> " + myEscapedJSONString);
                    sendMessage(recipient, myEscapedJSONString, token);
                }

            }

        }
    });
}

String.prototype.escapeSpecialChars = function () {
    return this.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\r|\n/g, "\\n")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");
};

function getResponseToUserRef(request_key, recipient, sender) {

    var url = 'http://halfcup.com/social_rebates_system/api/getResponseMessage?messenger_id=' + sender + '&request_key=' + request_key + '&messenger_uid=' + recipient;
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
                sendMessageUserRef(recipient, obj.data.jsonData, token);
            }
            if (code == 0) {
                var token = obj.messenger_data.pageAccessToken;
                //getResponseToUserWithNoKey(recipient, sender);
                //sendMessage(recipient, {"text" : "Sorry I don't understand what do you want"}, token);
            }

        }
    });
}

function getResponseToUserWithNoKey(recipient, sender) {
    var result = "";
    var url = 'http://halfcup.com/social_rebates_system/api/getResponseMessage?messenger_id=' + sender + '&request_key=' + sender + '&messenger_uid=' + recipient;
    console.log('url', url);
    request({
        url: url,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
            result = 'Error sending message: ' + error;
            return result;
        } else if (response.body.error) {
            console.log('Error : ', response.body.error);
            result = 'Error : ' + response.body.error;
            return result;
        } else {
            var obj = JSON.parse(body);
            console.log('json: ', obj);
            var code = obj.code;
            if (code == 1) {
                var token = obj.messenger_data.pageAccessToken;
                sendMessage(recipient, obj.data.jsonData, token);
            }
            if (code == 0) {
                var token = obj.messenger_data.pageAccessToken;
                //sendMessage(recipient, {"text" : "Sorry I don't understand what do you want"}, token);
            }
            result = JSON.stringify(response);
            return result;
        }
    });
}

app.get('/send', function (req, res) {
    //var userId = location.search.split('user_id=')[0]
    var recipientId = req.query.user_id; // $_GET["id"]
    //'1193481570735913'
    var token = "";
    sendMessage(recipientId, {text: "Echo: Selamat Datang " + recipientId}, token);
    res.send('OK ' + recipientId);
});

app.get('/send_multiple', function (req, res) {
    //var userId = location.search.split('user_id=')[0]
    var recipientIds = req.query.user_ids.split(','); // $_GET["id"]
    var messages = req.query.message; // $_GET["id"]
    //'1193481570735913'
    var token = req.query.token;
    for (i = 0; i < recipientIds.length; i++) {
        sendMessage(recipientIds[i], messages, token);
    }
    res.send('OK, Sent to :' + req.query.user_ids);
});

// Facebook Webhook
app.get('/fallback', function (req, res) {
    console.log('res - fallback ', res.body);
    res.send('Wellcome to fallback');
});

function leadgenProcessor(value) {


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

// generic function sending messages
function sendMessageUserRef(recipientId, message, token) {
    //console.log(process); process.env.PAGE_ACCESS_TOKEN
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: token},
        method: 'POST',
        json: {
            recipient: {user_ref: recipientId},
            message: message,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

// generic function sending messages
function sendMessagePostback(recipientId, message, token) {
    //console.log(process); process.env.PAGE_ACCESS_TOKEN
    request({
        url: 'https://graph.facebook.com/v2.6/me/messaging_postbacks',
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
        }
    });
};


function saveParamAi(page_id, reciever, prm, code) {
    console.log("SAVE PARAM AI");
    var url = 'http://halfcup.com/social_rebates_system/wapi/save?token=1234567890&api_name=PARAMS_AI&user_msg_id=' + reciever + '&page_id=' + page_id + '&prm=' + prm + '&' + code;
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

function getParamZ(emailContent, pageId, recipient) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/read?token=1234567890&api_name=PARAMS_AI&user_msg_id=' + recipient + '&page_id=' + pageId;
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
                if (obj.data !== null) {
                    var param = obj.data.prm;
                    // getAggregationObject(key, sender, recipient, token, res, param);
                    sendEmail(emailContent, pageId, param.split("=")[1]);
                }

            }
        }
    );
}
function clearAiKey(sender) {
    // http://localhost:8080/social_rebates_system/wapi/delete?token=1234567890&api_name=AI_PREV_KEYS_CLEAR&page_id=111
    var url = 'http://halfcup.com/social_rebates_system/wapi/delete?token=1234567890&api_name=AI_PREV_KEYS_CLEAR&page_id=' + sender;
    console.log('url', url);
    request({
            url: url,
            method: 'DELETE'
        }, function (error, response, body) {
            if (error) {
                console.log('Error delete ai keys: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
            }
        }
    );
}

// }).listen(1337, "127.0.0.1");
// console.log('Server running at http://127.0.0.1:1337/');