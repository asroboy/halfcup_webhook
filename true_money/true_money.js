module.exports = {
    test: function () {
        console.log("Halo lorem ipsum dolor sit amet");
    },
    postbackHandler: function (event, keyword) {
        postbackHandler(event, keyword);
    },
    inputTextHandler: function (event, text) {
        inputTextHandler(event, text);
    }

};

var request = require('request');
var urlApi = "http://aileadsbooster.com/TrueMoney/aggregation?object=";
var urlApiInputText = "http://aileadsbooster.com/TrueMoney/key?object=";
var urlApiGetLang = 'http://halfcup.com/social_rebates_system/trueMoneyApi/saveOrUpdate';

function postbackHandler(event, keyword) {
    if (keyword === "GREETINGS") {
        getJsonBot(event, keyword);
    }
    else {
        var recipient = event.sender.id;
        var lang ='';
        if(keyword.indexOf('lang=') > -1 && keyword.indexOf('START') > -1){
            lang = keyword.split('lang=')[1];
        }
        getLanguage(recipient, lang, event, keyword);

    }
}


function inputTextHandler(event, text) {
    getJsonBotInputText(event, text);
}

function getJsonBot(event, keyword) {
    var url = urlApi + keyword;
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
                console.log(JSON.stringify(obj.data[0]));
                var recipient = event.sender.id;
                var sender = event.recipient.id;
                var messages = obj.data;
                getToken(messages, sender, recipient);
            }
        }
    );
}

function getJsonBotInputText(event, text) {
    var url = urlApiInputText + text;
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
                console.log(JSON.stringify(obj.data[0]));
                var recipient = event.sender.id;
                var sender = event.recipient.id;
                var messages = obj.data;
                getToken(messages, sender, recipient);
            }
        }
    );
}

function getToken(messages, sender, recipient) {
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


                    var messages_ = JSON.stringify(messages);
                    console.log('message ==> ' + messages);
                    if (messages_.indexOf("{{first_name}}") > -1) {
                        getUserInfo(recipient, token, messages_);
                    } else {
                        // sendMessage(recipient,messages[0].message, token);
                        if (messages.length > 0) {
                            sendM(JSON.parse(messages_), recipient, token);
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
    console.log(message);
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


function getUserInfo(recipient, token, messages) {
    var url = 'https://graph.facebook.com/v2.6/' + recipient + '?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=' + token;
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
            var profile_user = JSON.parse(body);
            messages = messages.replace("{{first_name}}", profile_user.first_name);
            // sendMessage(recipient, JSON.parse(message), token);
            if (messages.length > 0) {
                sendM(JSON.parse(messages), recipient, token);
            }
        }
    });
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


function getLanguage(recipient_id, lang, event, keyword) {
    var url = urlApiGetLang + "?api_name=lang&lang=" + lang + "&recipeient_id=" + recipient_id;
    console.log(url)
    request({
        url: url,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            getJsonBot(event, keyword);
            console.log('============ ' + JSON.stringify(response) + ' =========== ');
        }
    });
}