var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var Analytics = require('analytics-node');
var analytics = new Analytics('kngf8THjj5e2QnLTdjfprebBW1KdQQbx');
var nlp = require('../nlp');
var new_nlp = require('../new_nlp');
var test = require('../test');
var true_money = require('../true_money/true_money');
var autotask = require('../autotask/index');
var page_subscription = require('../page_msg_subs/index');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));
const my_token = 'EAABqJD84pmIBABnOZBN1ekuimZAJTZAA5jMhKy6JTEoSZChGmdZBkZBhbEi7Wwhj25b4p0pzV1eEkHXnm0H9oRax4Gp0sjdFSED2xHmh8UyvigEClHm4vonwpBtAC4hwlBIOKayycMtdPqlxJqhfgNdiJGqfUij0jZA7RdZBtUWZAZCQZDZD';


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

// Facebook autotask
app.get('/autotask', function (req, res) {
    autotask.foo(res);
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
        try {
            var entries = req.body.entry;
            var changes = req.body.entry[0].changes;
            // console.log("POST WEBHOOK");
            console.log("REQ", JSON.stringify(req.body));
            if (changes) {
                var field = req.body.entry[0].changes[0].field;
                if (field == "leadgen") {
                    var value = req.body.entry[0].changes[0].value;

                    console.log("leadgen value " + JSON.stringify(value));
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

            for (j = 0; j < entries.length; j++) {
                var event = entries[j]
                console.log("=======EVENT CHECK=======");
                console.log('Event ' + j + ': ', JSON.stringify(event));
                var messagings = event.messaging;
                if (messagings) {
                    for (i = 0; i < messagings.length; i++) {
                        var messaging = messagings[i];
                        console.log("======= MESSAGING =======");
                        var hc_token = 'EAABqJD84pmIBABjewVhyAuMwDLFaI7YT7fsJLzeh63mhOwdZAgMKClvFfZBvHhFR35dIok3YQAxeZCuDbiLCaWVOpQxWVRHZBahsQOy9ZCTn4e4wdWcZA0VmGU6x0CFzv6dRcCzrlSZA87EPcI3b0KCDkedjLc37lZCvnu47iTTAwgZDZD';

                        if (event.id == messaging.recipient.id) {
                            console.log('Messaging from USER to PAGE');

                            if (messaging.referral) {
                                console.log('messaging.referral');
                                // var messaging = messaging.messaging[0];
                                // if(messaging.hasOwnProperty('referral')){
                                //     console.log('messaging.referral');
                                //     var referral = messaging.referral;
                                if (messaging.referral.hasOwnProperty('ref')) {
                                    console.log('messaging.referral.ref');
                                    console.log(messaging.referral.ref);
                                    if (messaging.referral.ref !== null) {
                                        if (messaging.referral.ref.indexOf("DONE_BOT") > -1 && messaging.referral.ref.indexOf('|param|') > -1) {
                                            if (messaging.referral.ref.indexOf('|param|') > -1) {
                                                var code = messaging.referral.ref.split('\|param\|')[1];

                                                // clearAiKey(messaging.recipient.id);
                                                // saveParamAi(messaging.recipient.id, messaging.sender.id, '', code);
                                                new_nlp.getChatBot(messaging.referral.ref, messaging.recipient.id, messaging.sender.id, res);
                                            }
                                        }
                                        else if (messaging.referral.ref.indexOf('|param|') > -1) {
                                            clearAiKey(messaging.recipient.id);
                                            var code = messaging.referral.ref.split('\|param\|')[1];
                                            var text = messaging.referral.ref.split('\|param\|')[0];
                                            console.log("code ", code);
                                            console.log("text ", text);
                                            saveParamAi(messaging.recipient.id, messaging.sender.id, '', code)
                                            new_nlp.getChatBot(text, messaging.recipient.id, messaging.sender.id, res);
                                        } else if(messaging.referral.ref.indexOf('portal|mobile|') > -1){
                                            var phone = messaging.referral.ref.split('\|')[2];
                                            if(phone !== ''){
                                                getToken('Hi, Thanks for sending us your contact ' + phone + '. ', messaging.recipient.id, messaging.sender.id, false);
                                            }

                                        } else if(messaging.referral.ref.indexOf('setting_up_push') > -1) {
                                            saveMessengerAdmin(messaging.sender.id, messaging.recipient.id);
                                        }else {

                                            new_nlp.getChatBot(messaging.referral.ref, messaging.recipient.id, messaging.sender.id, res);
                                        }
                                    }

                                }
                                // }

                            }

                            if (messaging.message) {
                                //NLP Handling
                                if (messaging.message.nlp) {
                                    new_nlp.handleMessage(messaging, messaging.message, res);
                                    //NON NLP Handling
                                } else {
                                    if (messaging.message) {
                                        var msg = messaging.message.text;
                                        if (messaging.sender.id === '912070908830063') {
                                            if (msg === 'Hi, I\'m Halfcup') {
                                                var message = {"text": "I can help you to remind food time at anytime u want"}
                                                sendMessage(messaging.recipient.id, message, hc_token);
                                            }
                                            if (msg === 'OK, I will guide you') {
                                                var message = {
                                                    "text": 'Do you need me to remind your breakfast time',
                                                    "quick_replies": [{
                                                        "content_type": "text",
                                                        "title": "Yes",
                                                        "payload": "DEVELOPER_SETUP_YES"
                                                    }, {
                                                        "content_type": "text",
                                                        "title": "No",
                                                        "payload": "DEVELOPER_SETUP_NO"
                                                    }]
                                                }
                                                sendMessage(messaging.recipient.id, message, hc_token);
                                            }
                                        }

                                        if (messaging.recipient.id === '912070908830063') {
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
                                                sendMessage(messaging.sender.id, message, hc_token);
                                            }

                                            if (msg === 'setup' || msg === 'Setup') {

                                                var message = {
                                                    "text": 'OK, do you need me to remind your breakfast time',
                                                    "quick_replies": [{
                                                        "content_type": "text",
                                                        "title": "Yes",
                                                        "payload": "DEVELOPER_SETUP_YES"
                                                    }, {
                                                        "content_type": "text",
                                                        "title": "No",
                                                        "payload": "DEVELOPER_SETUP_NO"
                                                    }]
                                                }
                                                sendMessage(messaging.sender.id, message, hc_token);
                                            }

                                            if (msg.indexOf('start') !== -1 || msg.indexOf('Start') !== -1) {

                                            }

                                            if ((msg.indexOf('How') !== -1 || msg.indexOf('how') !== -1) && (msg.indexOf('do') !== -1 || msg.indexOf('Do') !== -1)) {
                                                var message = {
                                                    "text": 'OK, I will guide you'
                                                }
                                                sendMessage(messaging.sender.id, message, hc_token);
                                            }
                                            // if(messaging.message.text !== 'GET_STARTED_PAYLOAD '){
                                            //     var message = {"text": "Yeah .. I know u're busy person"}
                                            //     sendMessage(messaging.sender.id, message, hc_token);
                                            // }

                                        }
                                    }

                                    if (messaging.message && messaging.message.text && messaging.sender) {
                                        //console.log("=======MESSAGE=======");
                                        //console.log('Message : ', event.message.text);

                                        /**
                                         * ACTIONS FOR QUICK REPLY
                                         */
                                        if (messaging.message.quick_reply) {
                                            console.log("=======QUICK REPLY=======");

                                            var find_prefix = messaging.message.quick_reply.payload.split('_');
                                            var payload_prefix = find_prefix[0];
                                            console.log("payload_prefix", payload_prefix);

                                            console.log("Payload ", messaging.message.quick_reply.payload);

                                            /**
                                             * Check if payload REGISTER_PAYLOAD (old Get started) button
                                             */
                                            if (messaging.message.quick_reply.payload === 'REGISTER_PAYLOAD') {
                                                getResponseToUser(messaging.message.quick_reply.payload, messaging.sender.id, messaging.recipient.id);
                                            }
                                            /**
                                             * Check if payload DEVELOPER (Get started) button
                                             */
                                            else if (payload_prefix === 'DEVELOPER') {
                                                console.log("Payload ", messaging.message.quick_reply.payload);
                                                pixel('QuickReply', messaging.message.text, messaging.message.quick_reply.payload, messaging.sender.id, messaging.recipient.id);
                                                getResponseToUser(messaging.message.quick_reply.payload, messaging.sender.id, messaging.recipient.id);
                                            }

                                            else if (payload_prefix === 'CUSTOM') {
                                                console.log('call new_nlp CUSTOM');
                                                new_nlp.getChatBot(messaging.message.quick_reply.payload, messaging.recipient.id, messaging.sender.id, res)
                                            }
                                            /**
                                             * Check if payload is BOT key
                                             */
                                            else if (payload_prefix === 'BOT' || payload_prefix === 'SHARE') {
                                                console.log("Payload ", messaging.message.quick_reply.payload);
                                                pixel('QuickReply', messaging.message.text, messaging.message.quick_reply.payload, messaging.sender.id, messaging.recipient.id);
                                                getResponseToUser(messaging.message.quick_reply.payload, messaging.sender.id, messaging.recipient.id);
                                            }
                                            /**
                                             * Check if payload is Multi BOT key(s)
                                             */
                                            else if ((payload_prefix === 'BOT' || payload_prefix === 'SHARE') && messaging.message.quick_reply.payload.indexOf(",") !== -1) {
                                                var payloads = messaging.message.quick_reply.payload.split(",");
                                                for (i = 0; i < payloads.length; i++) {
                                                    console.log("Payload " + i, payloads[i]);
                                                    pixel('QuickReply', messaging.message.text, payloads[i], messaging.sender.id, messaging.recipient.id);
                                                    getResponseToUser(payloads[i], messaging.sender.id, messaging.recipient.id);
                                                }
                                            }
                                            /**
                                             * MULTI KEY FORMAT [A]|[B]|BOT_xxxx_xxxx
                                             */
                                            else if ((messaging.message.quick_reply.payload.indexOf("|") > -1) && payload_prefix !== 'AGGREGATION' && !((find_prefix[0] === "TRUE") && (find_prefix[1] === "MONEY"))) {
                                                /**
                                                 * Split Payload marked with |
                                                 * @type {*}
                                                 */

                                                if (messaging.message.quick_reply.payload.indexOf('|param|') > -1) {
                                                    var code = messaging.message.quick_reply.payload.split('\|param\|')[1];
                                                    var text = messaging.message.quick_reply.payload.split('\|param\|')[0];
                                                    clearAiKey(messaging.recipient.id);
                                                    saveParamAi(messaging.recipient.id, messaging.sender.id, '', code);
                                                    new_nlp.getChatBot(text, messaging.recipient.id, messaging.sender.id, res);
                                                } else {
                                                    var keys = messaging.message.quick_reply.payload.split("|");
                                                    console.log("Payload ", messaging.message.quick_reply.payload);
                                                    var action_name = keys[0];
                                                    action_name = action_name.replace("[", "");
                                                    action_name = action_name.replace("]", "");


                                                    if (keys.length == 2) {
                                                        keyIndexAction(keys[1], messaging, action_name, "QuickReply");
                                                    }
                                                    if (keys.length == 3) {
                                                        keyIndexAction(keys[1], messaging, action_name, "QuickReply");
                                                        keyIndexAction(keys[2], messaging, action_name, "QuickReply");
                                                    }

                                                    if (keys.length == 4) {
                                                        keyIndexAction(keys[1], messaging, action_name, "QuickReply");
                                                        keyIndexAction(keys[2], messaging, action_name, "QuickReply");
                                                        keyIndexAction(keys[3], messaging, action_name, "QuickReply");

                                                    }
                                                }


                                            }

                                            //=====
                                            /**
                                             * if Payload is only text
                                             */
                                            // else if (messaging.message.quick_reply.payload) {
                                            //messaging.message.quick_reply.payload.indexOf('AGGREGATION_') > -1
                                            else if (payload_prefix === 'AGGREGATION') {
                                                new_nlp.getChatBot(messaging.message.quick_reply.payload, messaging.recipient.id, messaging.sender.id, res);
                                            }
                                            else if ((find_prefix[0] === "TRUE") && (find_prefix[1] === "MONEY")) {
                                                var keyword = messaging.message.quick_reply.payload.replace("TRUE_MONEY_", "");
                                                console.log("keyword " + keyword);
                                                true_money.postbackHandler(messaging, keyword);
                                            }

                                            else {
                                                console.log("QuickReply ", messaging.message.quick_reply.payload);
                                                var page_id = messaging.recipient.id;
                                                if (page_id === '474086889694869') {
                                                    page_subscription.reply(messaging.message.quick_reply.payload, messaging.sender.id, page_id, my_token);
                                                } else {
                                                    var isPhone = isPhoneNumber(messaging.message.quick_reply.payload);
                                                    if (isPhone) {
                                                        get_tracking_id("", messaging.sender.id, page_id, messaging.message.quick_reply.payload, isPhone, res);
                                                    } else {
                                                        //var token = "";
                                                        //this is to handle print PAYLOAD to msgr room
                                                        pixel('QuickReply', messaging.message.text, messaging.message.quick_reply.payload, messaging.sender.id, messaging.recipient.id);
                                                        getToken(messaging.message.quick_reply.payload, messaging.recipient.id, messaging.sender.id, false);
                                                    }
                                                }

                                            }
                                            // }
                                        }

                                        /**
                                         * ACTIONS FOR OTHERS
                                         */
                                        else {
                                            if (messaging.message.metadata) {
                                                var jsonMeta = JSON.parse(messaging.message.metadata);
                                                console.log('json meta', jsonMeta);
                                                if (jsonMeta.ad_id) {
                                                    console.log("=======ADS REPLY=======");
                                                    if (messaging.message.text.indexOf('{{') > -1)
                                                        new_nlp.getMerchantId(messaging.sender.id, messaging.recipient.id, messaging.message.text, res);
                                                    // getAdsResponseToUser(messaging.recipient.id, messaging.sender.id, jsonMeta.ad_id)
                                                }
                                            } else {
                                                if (messaging.message.text) {
                                                    console.log("===== messaging.message.text ========");
                                                    var request_key = messaging.message.text;
                                                    if (messaging.recipient.id === '198665724065584') {
                                                        true_money.inputTextHandler(messaging, request_key);
                                                    } else {
                                                        var isPhone = isPhoneNumber(request_key);
                                                        if (isPhone) {
                                                            get_tracking_id("",  messaging.sender.id, messaging.recipient.id,request_key, isPhone, res);
                                                        } else {
                                                            new_nlp.getMerchantId(messaging.recipient.id, messaging.sender.id, request_key, res);

                                                        }
                                                    }
                                                    // getResponseToUser(request_key, messaging.sender.id, messaging.recipient.id);
                                                }
                                            }
                                        }

                                    }

                                    if (messaging.message && messaging.message.attachments && messaging.sender) {
                                        console.log("===== messaging.message.text ========");
                                        var attachments = messaging.message.attachments
                                        if (attachments.length > 0) {
                                            var attachementType = attachments[0].type
                                            console.log("===== " + attachementType + " ========");
                                            if (attachementType === 'location') {
                                                var cord = attachments[0].payload.coordinates;
                                                console.log("===== " + JSON.stringify(cord) + " ========");

                                                if (typeof cord !== 'undefined') {
                                                    true_money.coordinatesHandler(messaging);
                                                }
                                            }

                                        }

                                        //var arr = JSON.parse(messaging.message.attachments);
                                        //getResponseToUser(messaging.message.attachments[0].payload.sticker_id, messaging.sender.id, messaging.recipient.id);
                                    }
                                }
                            }

                            /**
                             * ACTIONS FOR OPTIN
                             */
                            if (messaging.optin) {
                                var key = messaging.optin.ref;
                                console.log(key)
                                if (key === null) {

                                } else {
                                    if (messaging.optin.user_ref) {
                                        console.log(key)
                                        // getResponseToUserRef(key, messaging.optin.user_ref, messaging.recipient.id);
                                    } else if (key.indexOf("{{") > -1) {
                                        clearAiKey(messaging.recipient.id);
                                        new_nlp.getChatBot(key, messaging.recipient.id, messaging.sender.id, res);
                                    } else if (key === 'null') {

                                    } else {

                                    }
                                }

                            }

                            /**
                             * ACTIONS FOR POSTBACK
                             */
                            if (messaging.hasOwnProperty('postback')) {
                                if (messaging.postback.hasOwnProperty('payload')) {
                                    console.log("===== messaging.postback.payload ========");
                                    console.log("Payload : " + messaging.postback.payload);
                                    if (messaging.postback.payload.indexOf('|param|') > -1) {
                                        var ref = messaging.postback.payload;
                                        console.log("payload " + ref);
                                        if (ref.indexOf("halfcup.com") > -1) {
                                            ref = ref.replace("http://halfcup.com/social_rebates_system/app/msgredir?", "");
                                        }
                                        if (ref.indexOf("ref=") > -1) {
                                            ref = ref.split("ref=")[1];
                                        }
                                        console.log("payload after extract: " + ref);
                                        if (ref.indexOf("{{") > -1) {
                                            // new_nlp.getChatBot(ref, messaging.recipient.id, messaging.sender.id, res);

                                            if (ref.indexOf('|param|') > -1) {
                                                var code = ref.split('\|param\|')[1];
                                                var text = ref.split('\|param\|')[0];
                                                clearAiKey(messaging.recipient.id);
                                                saveParamAi(messaging.recipient.id, messaging.sender.id, '', code);
                                                new_nlp.getChatBot(text, messaging.recipient.id, messaging.sender.id, res);
                                            } else {
                                                new_nlp.getChatBot(ref, messaging.recipient.id, messaging.sender.id, res);
                                            }

                                        } else if (ref === 'null') {

                                        } else if (ref.indexOf("DONE_BOT") > -1) {
                                            if (ref.indexOf('|param|') > -1) {
                                                var code = ref.split('\|param\|')[1];

                                                // clearAiKey(messaging.recipient.id);
                                                // saveParamAi(messaging.recipient.id, messaging.sender.id, '', code);
                                                new_nlp.getChatBot(ref, messaging.recipient.id, messaging.sender.id, res);
                                            }
                                        } else {
                                            var keys = ref.split("|");

                                            // if (keys[0] === 'MESSAGE_ME') {
                                            // getResponseToUser(ref,messaging.sender.id, messaging.recipient.id );
                                            getToken(ref, messaging.recipient.id, messaging.sender.id, true);
                                            // }
                                        }
                                    }
                                    else {

                                        var find_prefix = messaging.postback.payload.split('_');
                                        var payload_prefix = find_prefix[0];

                                        console.log("find_prefix at 0 : " + find_prefix[0]);
                                        if (find_prefix.length > 1) {
                                            console.log("find_prefix at 1 : " + find_prefix[1]);
                                        }

                                        if ((payload_prefix === 'BOT' || payload_prefix === 'SHARE') && (messaging.postback.payload.indexOf(",") > -1)) {
                                            var payloads = messaging.postback.payload.split(",");
                                            console.log("payload_prefix === \"BOT \" && payload_prefix === \"SHARE\"");
                                            for (i = 0; i < payloads.length; i++) {
                                                console.log("Payload " + i, payloads[i]);
                                                pixel('PostBack', payloads[i], payloads[i], messaging.sender.id, messaging.recipient.id);
                                                getResponseToUser(payloads[i], messaging.sender.id, messaging.recipient.id);
                                            }
                                        }
                                        else if ((messaging.postback.payload.indexOf("|") > -1) && payload_prefix !== 'AGGREGATION' && !(find_prefix[0] === "TRUE" && find_prefix[1] === "MONEY")) {
                                            console.log("payload_prefix contains \| sign");
                                            if (messaging.postback.payload.indexOf('|param|') > -1) {
                                                console.log("payload_prefix has \|param\|");
                                                var code = messaging.postback.payload.split('\|param\|')[1];
                                                var text = messaging.postback.payload.split('\|param\|')[0];
                                                clearAiKey(messaging.recipient.id);
                                                saveParamAi(messaging.recipient.id, messaging.sender.id, '', code);
                                                new_nlp.getChatBot(text, messaging.recipient.id, messaging.sender.id, res);
                                            }

                                        }
                                        else if (payload_prefix === 'AGGREGATION') {
                                            console.log('call new_nlp AGGREGATION');
                                            // saveParamAi(messaging.recipient.id, messaging.sender.id, '', ####);
                                            new_nlp.getChatBot(messaging.postback.payload, messaging.recipient.id, messaging.sender.id, res)
                                        }
                                        else if (payload_prefix === 'LIVE') {
                                            console.log('call new_nlp LIVE');
                                            new_nlp.getChatBot(messaging.postback.payload, messaging.recipient.id, messaging.sender.id, res)
                                        }
                                        else if (payload_prefix === 'CUSTOM') {
                                            console.log('call new_nlp CUSTOM');
                                            new_nlp.getChatBot(messaging.postback.payload, messaging.recipient.id, messaging.sender.id, res)
                                        }

                                        /**
                                         * MULTI KEY FORMAT [A]|[B]|BOT_xxxx_xxxx
                                         * MULTI KEY FORMAT [A]|[B]|[BOT_xxxx_xxxx]|BOT_xxx_xxx
                                         */
                                        else if (messaging.postback.payload.indexOf("|") > -1 && !(find_prefix[0] === "TRUE" && find_prefix[1] === "MONEY")) {
                                            /**
                                             * Split Payload marked with |
                                             * @type {*}
                                             */
                                            var keys = messaging.postback.payload.split("|");
                                            console.log("Payload ", messaging.postback.payload);
                                            console.log("PAYLOAD KEY SIZE ", keys.length);

                                            var action_name = keys[0]; //action name
                                            action_name = action_name.replace("[", "");
                                            action_name = action_name.replace("]", "");

                                            if (keys.length == 2) {
                                                keyIndexAction(keys[1], messaging, action_name, "PostBack");
                                            }
                                            if (keys.length == 3) {
                                                keyIndexAction(keys[1], messaging, action_name, "PostBack");
                                                keyIndexAction(keys[2], messaging, action_name, "PostBack");
                                            }
                                            if (keys.length == 4) {
                                                keyIndexAction(keys[1], messaging, action_name, "PostBack");
                                                keyIndexAction(keys[2], messaging, action_name, "PostBack");
                                                keyIndexAction(keys[3], messaging, action_name, "PostBack");
                                                // index_1_action(action_name, reply_text_or_bot_key, keys[2], "PostBack", messaging);
                                            }
                                        }
                                        //***************
                                        else if (messaging.postback.payload === "USER_DEFINED_PAYLOAD") {
                                            pixel('PostBack', "Get Started", messaging.postback.payload, messaging.sender.id, messaging.recipient.id);
                                            getResponseToUser(messaging.postback.payload, messaging.sender.id, messaging.recipient.id);
                                        }
                                        else if (messaging.postback.payload.indexOf("{{") > -1) {
                                            console.log('call new_nlp messaging.postback.payload {{');
                                            new_nlp.getChatBot(messaging.postback.payload, messaging.recipient.id, messaging.sender.id, res);
                                        }
                                        else if ((find_prefix[0] === "TRUE") && (find_prefix[1] === "MONEY")) {
                                            var keyword = messaging.postback.payload.replace("TRUE_MONEY_", "");
                                            console.log("keyword " + keyword);
                                            true_money.postbackHandler(messaging, keyword);
                                        }
                                        else {
                                            pixel('PostBack', messaging.postback.payload, messaging.postback.payload, messaging.sender.id, messaging.recipient.id);
                                            getResponseToUserForPostback(messaging.postback.payload, messaging.sender.id, messaging.recipient.id);
                                        }
                                    }
                                }
                                if (messaging.postback.hasOwnProperty('referral')) {
                                    var ref = messaging.postback.referral.ref;
                                    console.log("messaging.postback.referral.ref");
                                    if (ref === null) {

                                    } else {
                                        if (ref.indexOf("{{") > -1) {
                                            // new_nlp.getChatBot(ref, messaging.recipient.id, messaging.sender.id, res);
                                            if (ref.indexOf('|param|') > -1) {
                                                var code = ref.split('\|param\|')[1];
                                                var text = ref.split('\|param\|')[0];
                                                clearAiKey(messaging.recipient.id);
                                                saveParamAi(messaging.recipient.id, messaging.sender.id, '', code);
                                                new_nlp.getChatBot(text, messaging.recipient.id, messaging.sender.id, res);
                                            } else {
                                                new_nlp.getChatBot(ref, messaging.recipient.id, messaging.sender.id, res);
                                            }
                                        } else if (ref === 'null') {

                                        } else if (ref.indexOf("DONE_BOT") > -1) {
                                            if (ref.indexOf('|param|') > -1) {
                                                var code = ref.split('\|param\|')[1];
                                                // clearAiKey(messaging.recipient.id);
                                                // saveParamAi(messaging.recipient.id, messaging.sender.id, '', code);
                                                new_nlp.getChatBot(ref, messaging.recipient.id, messaging.sender.id, res);
                                            }
                                        } else {
                                            var keys = ref.split("|");
                                            // if (keys[0] === 'MESSAGE_ME') {
                                            // getResponseToUser(ref,messaging.sender.id, messaging.recipient.id );
                                            // getToken(ref, messaging.recipient.id, messaging.sender.id, true);
                                            // }
                                        }

                                    }

                                }
                            }
                        }
                        else {
                            console.log('Messaging from PAGE to USER');
                        }

                    }

                }
            }


            res.sendStatus(200);
        } catch (error) {
            console.log("Error catched ==>", error);
            res.sendStatus(500);
        }

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

function keyIndexAction(key, messaging, action_name, event_name) {
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
                    pixel(event_name, action_name, payloads[i], messaging.sender.id, messaging.recipient.id);
                    if (event_name === "PostBack") {
                        getResponseToUserForPostback(payloads[i], messaging.sender.id, messaging.recipient.id);
                    } else {
                        var resp = getResponseToUser(payloads[i], messaging.sender.id, messaging.recipient.id);
                        console.log("GET RESPONSE TO USER : ", resp);
                    }
                }
            } else {
                pixel(event_name, action_name, reply_text, messaging.sender.id, messaging.recipient.id);
                if (event_name === "PostBack") {
                    getResponseToUserForPostback(reply_text, messaging.sender.id, messaging.recipient.id);
                } else {
                    getResponseToUser(reply_text, messaging.sender.id, messaging.recipient.id);

                }
            }
        } else if (reply_text.indexOf('{{') > -1) {
            reply_text = reply_text.replace('{{', "")
            reply_text = reply_text.replace('}}', "")
            new_nlp.getChatBot(reply_text, messaging.recipient.id, messaging.sender.id, res);
        } else {
            if (reply_text !== "") {
                getToken(reply_text, messaging.recipient.id, messaging.sender.id, false);
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
                    pixel(event_name, action_name, payloads[i], messaging.sender.id, messaging.recipient.id);
                    if (event_name === "PostBack") {
                        getResponseToUserForPostback(payloads[i], messaging.sender.id, messaging.recipient.id);
                    } else {
                        getResponseToUser(payloads[i], messaging.sender.id, messaging.recipient.id);
                    }
                }
            } else if ((p_prefix === 'BOT' || p_prefix === 'SHARE')) {
                pixel(event_name, action_name, key, messaging.sender.id, messaging.recipient.id);
                if (event_name === "PostBack") {
                    getResponseToUserForPostback(key, messaging.sender.id, messaging.recipient.id);
                } else {
                    var resp = getResponseToUser(key, messaging.sender.id, messaging.recipient.id);
                    console.log("GET RESPONSE TO USER : ", resp);
                }
            }
        } else if (key.indexOf('{{') > -1) {
            key = key.replace('{{', "")
            key = key.replace('}}', "")
            new_nlp.getChatBot(key, messaging.recipient.id, messaging.sender.id, res);
        } else {
            if (key !== "") {
                getToken(key, messaging.recipient.id, messaging.sender.id, false);
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
    var url = 'https://graph.facebook.com/v2.8/' + user_msg_id + '?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=' + page_token;
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
                    getPageAccessTokenForLead(obj.pageId, message, leadgenId, formId, emailMessage)
                }
                if (code == 0) {
                    console.log('TOKEN NOT FOUND');
                    return "";
                }

            }
        }
    );
}


function getPageAccessTokenForLead(sender, message, leadgenId, formId, emailMessage) {
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
                    var email = obj.email;
                    var recipientId = obj.messenger_data.adminMessengerId;
                    // var longLiveToken = "EAABqJD84pmIBAP4xtPj3NTLfCzWp17iZByoFndpbnEq79ZAOGs7XdF5YMO5i1GgQ3zHex200f2uvLHWqzFxRk0RrC1jV7RZBZAqtU2mLluefhmexnX7SSnTP63Hy2x3AAvv5FgkU48FE95fpj7c8ZBREHJIVBYg4ZD";
                    var longLiveToken = "EAABqJD84pmIBAP6U37LseOrNLP6Xt13zCRR8dUCcNS4T1tKFQd8JZAyGQJOPq4mOfHazyppWRGYQaO2aaT1vQA4HNSEu10D6CgH220ND9ecweec3WOMGsvbIMv1gzJI5NrYXRKf5Nqmc8o9cfJdG9eBeU1UZBuOK2iSZCBlogZDZD";
                    var urlGetLead = "https://graph.facebook.com/v2.9/" + leadgenId + "?access_token=" + token;
                    console.log("LEAD URL " + urlGetLead);
                    emailMessage = emailMessage + "<br/>Agent Name: " +  obj.restaurant_name
                        + "<br/>Agent Email: " +  email
                        + "<br/>Page ID: " +  sender
                        + "<br/>Page Name: " +  obj.page_name

                    getLead(urlGetLead, token, message, recipientId, sender, formId, emailMessage, email);
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


function getLead(url, token, message, recipientId, sender,formId, emailMessage, email) {

    var urlGetLead = "https://graph.facebook.com/v2.9/" + formId + "?access_token=" + token;
    console.log("GET FORM NAME URL " + urlGetLead);
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
                    var form_name = obj.name
                    emailMessage = emailMessage + "<br>Form Name : " + form_name;

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
                                    // sendMessage(recipientId, msg, token);



                                    console.log('emailMessage ' + emailMessage);

                                    sendEmailForLead(emailMessage, sender, email);
                                }

                            }
                        }
                    );
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

function sendEmailForLead(message, page_id, email) {
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

            // message = "<b>PAGE : " + JSON.parse(body).name + "</b> <br/><br/> " + message;
            //brotherho@halfcup.com
            //asrofiridho@gmail.com

            //sendEmail sendMultipleEmail for multiple target
            var url = 'http://halfcup.com/social_rebates_system/api/sendMultipleEmail?' +
                'sender=noreply@halfcup.com' +
                '&receiver=brotherho@halfcup.com,'+ email +
                '&subject=NEW LEAD RECIEVED'+
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
        url: 'https://graph.facebook.com/v2.8/me/messages',
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
        url: 'https://graph.facebook.com/v2.8/me/messages',
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
        url: 'https://graph.facebook.com/v2.8/me/messaging_postbacks',
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


function get_tracking_id(aggregation, messenger_id, page_id, textOrPhone, isPhone, res) {
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

            if(isPhone){
                new_nlp.phoneAction(textOrPhone, page_id, messenger_id, res);
            }
        }
    });
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


function isPhoneNumber(phone) {

    var phoneno = /^(?!.*911.*\d{4})((\+?1[\/ ]?)?(?![\(\. -]?555.*)\( ?[2-9][0-9]{2} ?\) ?|(\+?1[\.\/ -])?[2-9][0-9]{2}[\.\/ -]?)(?!555.?01..)([2-9][0-9]{2})[\.\/ -]?([0-9]{4})$/;

    var phoneno2 = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

    var phoneno3 = /^[+]?(1\-|1\s|1|\d{3}\-|\d{3}\s|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/g;

    var phoneno4 = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;

    var phoneno5 = /(\+62 ((\d{3}([ -]\d{3,})([- ]\d{4,})?)|(\d+)))|(\(\d+\) \d+)|\d{3}( \d+)+|(\d+[ -]\d+)|\d+/;
    if (phone.match(phoneno) || phone.match(phoneno2) || phone.match(phoneno3) || phone.match(phoneno4) || phone.match(phoneno5)) {
        return true;
    } else {
        return false;
    }
}


