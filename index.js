const http = require('http');
const express = require('express');
const app = express();

var api = require('./node_modules/clicksend/api.js');
const escapeHtml = require('escape-html');
const CEBUANO = require('./messages/cebuano.json')

// TO BE ADDED TO REPO VARIABLES
const CLICKSEND_CONFIG = {
    username: "namaeconde@gmail.com",
    apikey: "810D2B8C-1060-BACC-A36A-057D72FC8885",
    sharedNumber: "+639221000119"
}

app.post('/responder', (req, res) => {
    var smsMessage = new api.SmsMessage();
    smsMessage.from = CLICKSEND_CONFIG.sharedNumber;
    smsMessage.to = "+639992216589";
    smsMessage.body = CEBUANO.CONSULTATION_EMERGENCY_MSG;

    var smsApi = new api.SMSApi(CLICKSEND_CONFIG.username, CLICKSEND_CONFIG.apikey);

    var smsCollection = new api.SmsMessageCollection();

    smsCollection.messages = [smsMessage];

    smsApi.smsSendPost(smsCollection).then(function(response) {
        console.log(response.body);
        res.send(response.body);
    }).catch(function(err){
        console.error(err.body);
        res.send(err.body);
    });
});
  
http.createServer(app).listen(1337, () => {
    console.log('Express server listening on port 1337');
});

exports.helloHttp = (req, res) => {
    res.send(`Hello ${escapeHtml(req.query.name || req.body.name || 'World')}!`);
};