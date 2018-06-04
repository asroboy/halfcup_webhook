module.exports = {
    test: function (res) {
        // test_auto_task(res);
        someAsyncOperation(() => {
            const startCallback = Date.now();
            console.log("start callback at " + startCallback);
            // do something that will take 10ms...
            while (Date.now() - startCallback < 10) {
                // do nothing
            }
        }, res);
    }
};

var request = require('request');
var tokenTest = 'EAABqJD84pmIBAJMrzrRQsyunRMk4ONmSkegazzoI7DbS6xZBLcKOUITc1yqzZBv4wKqHGEa77DYEQJK5rJTU2SFoGaoKKmeplLT3z1n6t1fulizTZB2B8np6fa6uhHQz\n' +
    'CImcwzMZATAtaWfff1OMm7PbRjfOthdxjW7vqHlCceEjddlvx1jj5nG6QCwqV4cZD';
function test_auto_task(res, message) {
    // res.send(message);
}


const fs = require('fs');

function someAsyncOperation(callback, res) {
    // Assume this takes 95ms to complete
    fs.readFile('/path/to/file', callback);
    // res.send('ok')
    const timeoutScheduled = Date.now();

    setTimeout(() => {
        const delay = Date.now() - timeoutScheduled;
        sendMessage('325277791333856','1694918677293172', `${delay} ms have passed since I was scheduled`, tokenTest);
        console.log(`${delay} ms have passed since I was scheduled`);


    }, 1000 * 20);
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