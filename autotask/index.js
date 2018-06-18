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
const my_token = 'EAABqJD84pmIBAJZAGhdNzdHYwcLV42v3mh3vQIPGgJiGUqngVhZCjxynEKRfMR0NlzsR5hLNmMKa9guVGDgnC7F9oqfqd166X0lixWsAlQlMZB4t24UMie2FT8ZBf9TiOR3jZBjXWVUfNxCx2JQ1JkDDFTsZATvjaMUumCqJ34XQZDZD';

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

    }, 1000 * 2);
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
                    get_reserved_message(page_id, recipient_id, fb_token, reserved_parameter);
                    console.log(prev_task_id + `ms have passed since I was scheduled`);
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

                if(obj.reserved.length > 0){
                    mStartAutoReply(null, recipient_id, page_id, fb_token, obj.reserved);
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
            update_webhook_status(page_id, "Error: " + err);
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


function update_webhook_status(page_id, status) {
    // http://localhost:8080/social_rebates_system/wapi/delete?token=1234567890&api_name=AI_PREV_KEYS_CLEAR&page_id=111
    var url = 'http://halfcup.com/social_rebates_system/messengerPage/update_webhook_status?page_id=' + page_id + '&status=' + status;
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