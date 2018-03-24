module.exports = {
    test: function () {
        console.log("Halo lorem ipsum dolor sit amet");
    },
    postbackHandler: function (event, keyword) {
        postbackHandler(event, keyword)
    },

};

var request = require('request');
var urlApi = "http://aileadsbooster.com/TrueMoney/aggregation?object=";

function postbackHandler(event, keyword) {
    if (keyword === "GREETINGS") {
        getGreetings(event, keyword);
    }
}

function getGreetings(event, keyword) {
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
                getToken(obj.data[0], sender, recipient);
            }
        }
    );
}


function getToken(message, sender, recipient) {
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
                    sendMessage(recipient, message, token)

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
