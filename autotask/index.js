module.exports = {
    test: function (res, recipient, page_id, fb_token) {
        // test_auto_task(res);
        const startCallback = Date.now();
        var task_id = startCallback + '-' + recipient;
        someAsyncOperation(() => {

            console.log("start callback at " + startCallback);
            save_delay_task(page_id, recipient, task_id);
            // do something that will take 10ms...
            while (Date.now() - startCallback < 10) {
                // do nothing
            }
        }, res, task_id, recipient, page_id, fb_token, '');
    },
    startAutoReply: function (res, recipient, page_id, fb_token, reserved_parameter) {
        // test_auto_task(res);
        const startCallback = Date.now();
        var task_id = startCallback + '-' + recipient;
        someAsyncOperation(() => {

            console.log("start callback at " + startCallback);
            save_delay_task(page_id, recipient, task_id);
            // do something that will take 10ms...
            while (Date.now() - startCallback < 10) {
                // do nothing
            }
        }, res, task_id, recipient, page_id, fb_token, reserved_parameter);
    }
};

var request = require('request');
//token development page
const my_token = 'EAABqJD84pmIBAHHu7FKRXuUr7Qra0DZBiev8ZAQZAkihWky8669VMsS5U4I9NlCkh6W4BleCCM9ZAmZBQpa4ILAZClLM1CHzQ9bZAvg3ZCc8hjWUzVZCWj2TNIffkSMzg3tKajKZB0ZCYdImECDFW0NsDJuzBxz29avMqwMUZBGip9806wZDZD';

const fs = require('fs');

function someAsyncOperation(callback, res, task_id, recipient, page_id, fb_token, reserved_parameter) {
    // Assume this takes 95ms to complete
    fs.readFile('/path/to/file', callback);
    // res.send('ok')
    const timeoutScheduled = Date.now();
    setTimeout(() => {
        const delay = Date.now() - timeoutScheduled;
        if (page_id === '1724621464435440') {
            fb_token = my_token;
        }
        get_delay_task(page_id, recipient, task_id, fb_token, reserved_parameter);

    }, 1000 * 4);
}


// do someAsyncOperation which takes 95 ms to complete
// generic function sending messages
function sendMessage(page_id, recipientId, message, token) {

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
            console.log('============ ' + response + ' =========== ');
        }
    });
};


function save_delay_task(page_id, recipient_id, task_id) {
    var url = 'http://halfcup.com/social_rebates_system/webhookApi/save_delay_task?page_id=' +
        page_id + '&recipient_id=' + recipient_id + '&task_id=' + task_id;
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
            }
        }
    );
}

function get_delay_task(page_id, recipient_id, prev_task_id, fb_token, reserved_parameter) {
    var url = 'http://halfcup.com/social_rebates_system/webhookApi/get_delay_task?page_id=' +
        page_id + '&recipient_id=' + recipient_id;
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
                console.log("RESULT ", obj.data.taskId + " === " + prev_task_id)
                if (obj.data.taskId === prev_task_id) {
                    var message = {"text": 'Hi this message auto send 20s after your last message'};
                    // sendMessage(page_id, recipient_id, message, fb_token);
                    if(reserved_parameter !== ''){
                        console.log('==================AUTO TAASK EXECUTE====================');
                        console.log(prev_task_id + `ms have passed since I was scheduled`);
                        get_reserved_message(page_id, recipient_id, fb_token, reserved_parameter);
                    }else{
                        console.log(prev_task_id + ` ms >> reserved param is empty`);
                    }

                } else {
                    console.log(prev_task_id + ` AUTOTASK DESTROYED`);
                }

            }
        }
    );
}


function get_reserved_message(page_id, recipient_id, fb_token, reserved_parameter) {
    var url = 'http://aileadsbooster.com/Backend/reserved?param=' + reserved_parameter;
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
                if (obj.aggregation.length > 0) {
                    sendM(page_id, obj.aggregation, recipient_id, fb_token);
                }
                if (obj.hasOwnProperty('reserved')){
                    if(obj.reserved.length > 0){
                        mStartAutoReply(null, recipient_id, page_id, fb_token, obj.reserved);
                    }
                }

            }
        }
    );
}


//aileadsbooster.com/Backend/reserved?reserved_parameter.

function sendM(page_id, messages, recipient, token) {
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
                                m.attachment.payload = {attachment_id: obj.attachment_id};
                            } else {
                                var url = 'https://graph.facebook.com/v2.6/me/message_attachments?access_token=' + token;
                                console.log('# SAVE ATTACHMENT ID ', url);
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
                                        // var obj_ = JSON.parse(body_);
                                        console.log('# SAVE ATTACHMENT ID RESULT ', JSON.stringify(body_));
                                        save_uploaded_attachmentid_m(obj.attachment_id, page_id, recipientId, message, token);
                                        m.attachment.payload = {attachment_id: obj.attachment_id};
                                    }
                                });
                            }
                        }
                    });
                }
            }
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
                // res.json(success);
            }
        });

        i++;
    }

    // make a copy of the original users Array because we're going to mutate it
    getOneM(Array.from(messages));
}


function save_uploaded_attachmentid_m(attachment_id, page_id, recipientId, message, token) {
    var url = 'http://halfcup.com/social_rebates_system/apix/save_messenger_attachment_id?page_id=' + page_id
        + '&url=' + message.attachment.payload.url
        + '&type=' + message.attachment.type
        + '&attachment_id=' +attachment_id;
    console.log('# SAVE ATTACHMENT ID url', url);
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
            console.log('==> SAVE ATTACHMENT ID RESULT :', JSON.stringify(obj));
            if (obj.attachment_id !== null) {
                console.log('---> message', JSON.stringify(message));
            }
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


function mStartAutoReply(res, recipient, page_id, fb_token, reserved_parameter) {
    // test_auto_task(res);
    const startCallback = Date.now();
    var task_id = startCallback + '-' + recipient;
    someAsyncOperation(() => {

        console.log("start callback at " + startCallback);
        save_delay_task(page_id, recipient, task_id);
        // do something that will take 10ms...
        while (Date.now() - startCallback < 10) {
            // do nothing
        }
    }, res, task_id, recipient, page_id, fb_token, reserved_parameter);
}



function hideLoading(token, recipientId) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: token},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            sender_action: "typing_off"
        }
    }, function (error, response, body) {
    });
}