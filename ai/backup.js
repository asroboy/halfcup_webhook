
function sendWhatsAppLead(agent_phone, mobile, email, interest, project_name, agent_name) {
    var urlWhatsapp = 'http://aileadsbooster.com/AIAssist/get_leads?agent=' + agent_name + '&project=' + project_name
        + '&plugin=leads_form&agent_phone=' + agent_phone + '&customer_phone=' + mobile + '&customer_email=' + email + '&others=' + interest;
    console.log("SEND WHATSAPP api : " + urlWhatsapp);
    request({
        url: urlWhatsapp,
        method: 'GET'
    }, function (error, response, body) {
        if (!error) {
            console.log(body);
        } else {
            console.log("Error send whatsapp api");
        }
    });
}



function getAdsResponseToUser(recipient, sender, ads_id) {

    var result = "";
    var url = 'http://halfcup.com/social_rebates_system/api/getBotAdsResponseMessage?messenger_id=' + sender + '&ads_id=' + ads_id + '&messenger_uid=' + recipient;
    console.log('url', url);
    request({
        url: url,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
            result = 'Error sending message: ' + error;
            return result;
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            var obj = JSON.parse(body);
            console.log('json: ', obj);
            var code = obj.code;
            if (code == 1) {
                var token = obj.messenger_data.pageAccessToken;
                result = sendMessage(recipient, obj.data.jsonData, token);
                return result;
            }
            if (code == 0) {
                var token = obj.messenger_data.pageAccessToken;
                //sendMessage(recipient, {"text" : "Sorry I don't understand what do you want"}, token);
                result = JSON.stringify(response);
                return result;
            }

        }
    });
}


function getParamZ(emailContent, pageId, recipient) {
    var url = 'http://halfcup.com/social_rebates_system/wapi/read?token=1234567890&api_name=PARAMS_AI&user_msg_id=' + recipient + '&page_id=' + pageId;
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
                console.log('getChatBot RESULT: ', obj);
                if (obj.data !== null) {
                    var param = obj.data.prm;
                    // get###AggregationObject(key, sender, recipient, token, res, param);
                    sendEmail(emailContent, pageId, param.split("=")[1]);
                }

            }
        }
    );
}


// generic function sending messages
function sendMessagePostback(recipientId, message, token) {
    //console.log(process); process.env.PAGE_ACCESS_TOKEN
    request({
        url: 'https://graph.facebook.com/v2.8/me/messaging_postbacks',
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
        }
    });
};
