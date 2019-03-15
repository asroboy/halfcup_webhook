/**
 * Created by Ridho on 11/9/2018.
 */

var http = require('http');
var request = require('request');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World!');

    function call() {
        // request({
        //     url: 'https://aileadsbooster.com/Engine/reportLeads',
        //     method: 'POST',
        //     data:{
        //         admin:"6590996758",
        //         customer: "6590996758",
        //         agent_1: "6596215071",
        //         agent_2: "6596215071",
        //         whatsapp_message: "3_bedroom",
        //         whatsapp_image_url: ""
        //     }
        // }, function (error, response, body) {
        //     if (!error) {
        //         console.log(body);
        //     } else {
        //         console.log("Error send whatsapp api");
        //     }
        // });

        var agent_1_phone = '65123456';
        var r = agent_1_phone.indexOf('65') == 0 ? agent_1_phone.replace('65', "") : agent_1_phone;
        console.log(r)


        // var options = { method: 'POST',
        //     url: 'https://aileadsbooster.com/Engine/reportLeads',
        //     headers:
        //         { 'Postman-Token': '0790c760-9c4f-4962-9f6b-44329fce714c',
        //             'cache-control': 'no-cache',
        //             'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
        //     formData:
        //         {   admin: '6590996758',
        //             customer: '6590996758',
        //             agent_1: '6596215071',
        //             agent_2: '',
        //             whatsapp_message: '3_bedroom',
        //             whatsapp_image_url: '' } };
        //
        // request(options, function (error, response, body) {
        //     if (error) throw new Error(error);
        //
        //     console.log(body);
        // });

    }
    call();
}).listen(1337);

console.log('Server running at http://127.0.0.1:1337/');


