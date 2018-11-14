/**
 * Created by Ridho on 11/9/2018.
 */

var http = require('http');
var request = require('request');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World!');

    function call() {
        var url = 'http://halfcup.com/social_rebates_system/api/addNewLead?page_id=1660056397350648&leadId=1020812351455453&adId=6102080206712&adName=&adSetId=6102080206712&adSetName=&campainId=&campainName=&formId=1008160509387304&formName=&fullName=汉汉&mobile=+6588688831&email=mrhannlim@gmail.com&otherFields=&fieldsValues=';
        request({
                url: url,
                method: 'GET'
            }, function (error, response, body) {
                var obj = JSON.parse(body);
                console.log(obj);
            }
        );
    }
    call();
}).listen(1337);

console.log('Server running at http://127.0.0.1:1337/');


