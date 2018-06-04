module.exports = {
    foo: function (res) {
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


function test_auto_task(res, message) {
    res.send(message);
}


const fs = require('fs');

function someAsyncOperation(callback, res) {
    // Assume this takes 95ms to complete
    fs.readFile('/path/to/file', callback);
    res.send('ok')
    const timeoutScheduled = Date.now();

    setTimeout(() => {
        const delay = Date.now() - timeoutScheduled;

        console.log(`${delay} ms have passed since I was scheduled`);


    }, 1000 * 5);
}



// do someAsyncOperation which takes 95 ms to complete
