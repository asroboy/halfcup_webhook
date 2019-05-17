/**
 * Created by Ridho on 10/22/2017.
 */
module.exports = {
    foo: function (res) {
        // whatever
        console.log("From test");
        test();
        // getAiToken();
    }
};


// Include the async package
// Make sure you add "async" to your package.json
var async = require("async");

function test() {
    // create a queue object with concurrency 2
    var q = async.queue(function (task, callback) {
        console.log('hello ' + task.name + ' task.number ' + task.number);
        callback();
    }, 1);

// assign a callback
    q.drain = function () {
        console.log('all items have been processed');
    };

    var i = "   s";
// add some items to the queue
    q.push({name: 'foo', number: 1}, function (err) {
        console.log('finished processing' + i);
    });
    q.push({name: 'bar', number: 2}, function (err) {
        console.log('finished processing bar');
    });

// add some items to the queue (batch-wise)
    q.push([{name: 'baz', number: 3}, {name: 'bay', number: 4}, {name: 'bax', number: 5}], function (err) {
        console.log('finished processing item');
    });

// add some items to the front of the queue
    q.unshift({name: 'bar', number: 6}, function (err) {
        console.log('unsift finished processing bar');
    });

}

