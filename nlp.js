/**
 * Created by Ridho on 9/28/2017.
 */

module.exports = {
    foo: function (res) {
        // whatever
        console.log("From nlp");
        res.send(halo());
    },
    handleMessage: function(event, message){
        handleMessage(event,  message)
    }
};


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
        getToken("Hi, im testing", event.recipient.id, event.sender.id, false);
        // sendMessage(event.recipient.id, reply, token);
    } else {
        // default logic
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
