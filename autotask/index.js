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
var tokenTest = 'EAABqJD84pmIBALdpymtZClTZCemLIyLMQjzzZCN1poHRIdFBRQTpVlXJhBVQq1ncVIIt1ZCGk0cgkV8sKqWR15T84whAeB7HP0yUR3OrQXKoQUhjT1fgl1S7oRaV1PPOyME5ufe3P9MJxWygtZBgmYznXd1KeY2GU4ZAs3RazDtgZDZD';

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
        var message = {"text": `${delay} ms have passed since I was scheduled`};
        sendMessage('325277791333856', '1724621464435440', message, tokenTest);
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
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            console.log('============ ' + response + ' =========== ');
        }
    });
};