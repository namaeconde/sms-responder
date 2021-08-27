const express = require('express');
const app = express();
app.use(express.json()) 

var api = require('./node_modules/clicksend/api.js');
const CEBUANO = require('./messages/cebuano.json');

// Info from https://doh.gov.ph/sites/default/files/basic-page/Region%207%20Hospitals.pdf
const PUBLIC_DOCTORS = require('./doctors_data/region_7/public_doctors.json'); // Set to Region 7 for now

// STUBBED DATA FOR NOW
const PRIVATE_DOCTORS = require('./doctors_data/region_7/private_doctors.json'); // Set to Region 7 for now

// TO BE ADDED TO REPO VARIABLES
const CLICKSEND_CONFIG = {
    username: "namaeconde@gmail.com",
    apikey: "810D2B8C-1060-BACC-A36A-057D72FC8885",
    sharedNumber: "+639221000119"
}

// TO STORE MESSAGES RECEIVED TO DB BY MSGID
// FETCH REPLIES BASED ON PREVIOUS RESPONSES
function getCebuanoReply(messageId, body, original_body) {
    const keyword = body.toLowerCase();
    switch(keyword) {
        case "tambag":
            return CEBUANO.PRIVATE_PUBLIC_MSG
        case "tabang":
            return CEBUANO.ASK_EMERGENCY_LOCATON_MSG
        case "private":
            return CEBUANO.ASK_ADDRESS_MSG
        case "public":
            // Public doctors information per region will be stored in a database
            // Fetch based on senders address and random from list
            const CEBUPROVINCE_PUBLIC_DOCTORS = PUBLIC_DOCTORS["cebu_province"] // Set to Cebu Province for now
            const publicDoctorAssigned = CEBUPROVINCE_PUBLIC_DOCTORS[Math.floor(Math.random() * CEBUPROVINCE_PUBLIC_DOCTORS.length)];
            return `Ang imung request gisend na kay ${publicDoctorAssigned.name} nga naa sa ${publicDoctorAssigned.hospital}. Mahimo pud nimo siya tawagan sa ${publicDoctorAssigned.tel}. Salamat sa paghulat sa iyang reply. Maayong adlaw.`
        case "virtual":
            return CEBUANO.SIGNUP_LINK_MSG + " https://platform.impact2050.com/register?consultation=virtual";
        case "visit":
            return CEBUANO.SIGNUP_LINK_MSG + " https://platform.impact2050.com/register?consultation=visit";
        case "text":
            // Private doctors information per region will be stored in a database
            // Fetch based on senders address and random from list
            const CEBUPROVINCE_PRIVATE_DOCTORS = PRIVATE_DOCTORS["cebu_province"] // Set to Cebu Province for now
            const privateDoctorAssigned = CEBUPROVINCE_PRIVATE_DOCTORS[Math.floor(Math.random() * CEBUPROVINCE_PRIVATE_DOCTORS.length)];
            return `Ang imung request gisend na kay ${privateDoctorAssigned.name} nga naa sa ${privateDoctorAssigned.hospital}. Mahimo pud nimo siya tawagan sa ${privateDoctorAssigned.tel} sa iyang business hours ${privateDoctorAssigned.business_hours}. Salamat sa paghulat sa iyang reply. Maayong adlaw.`
        default:
            if (original_body == CEBUANO.ASK_EMERGENCY_LOCATON_MSG) {
                return 
            } else if (original_body == CEBUANO.ASK_ADDRESS_MSG) {
                return CEBUANO.CONSULTATION_TYPE_MSG
            }
            
            return CEBUANO.CONSULTATION_EMERGENCY_MSG
    }
}

app.post('/reply', function (req, res) {
    const senderSMS = req.body;
    console.log("SENDER SMS INFO")
    console.log(senderSMS)

    const from = senderSMS.from;
    const body = senderSMS.body;
    const messageId = senderSMS.messageId;
    const original_body = senderSMS.original_body;

    var smsMessage = new api.SmsMessage();
    smsMessage.from = CLICKSEND_CONFIG.sharedNumber;
    smsMessage.to = from;
    smsMessage.body = getCebuanoReply(messageId, body, original_body); // Set to Cebuano for now

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

exports.smsbot = app;