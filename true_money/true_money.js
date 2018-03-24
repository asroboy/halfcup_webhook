module.exports = {
    test: function () {
        console.log("Halo lorem ipsum dolor sit amet");
    },
    postbackHandler : function (event, keyword) {
        postbackHandler(event, keyword)
    },

};

var request = require('request');
var urlApi = "http://aileadsbooster.com/TrueMoney/aggregation?object=";

function postbackHandler(event, keyword){
    if(keyword === "GREETINGS"){
        getGreetings(keyword);
    }
}

function getGreetings(keyword){
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
                console.log(obj);
            }
        }
    );
}


