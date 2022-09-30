const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config()

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const token = process.env.TOKEN;
const myToken = process.env.MY_TOKEN;

app.listen(process.env.PORT || 5000, () => {
    console.log('Node server is start on 8000 port test');
});

app.get("/", (req, res) => {
    console.log('Default get request called');
    // res.status(200).send("This is sample of Whatsapp webhook's");
    res.send('Your request loaded correctly');
});

// To verify webhooks
app.get('/webhooks', (req, res) => {
    let mode =  req.query["hub.mode"];
    let challenge = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];

    if(mode && token) {
        if(mode === "subscribe" && token === myToken ) {
            res.status(200).send(challenge);
        } else {
            res.status(403);
        }
    }
}
);

app.post('/webhooks', (req, res) => {
    let bodyParam = req.body;
    console.log(JSON.stringify(bodyParam, null, 2));

    console.log("Msg object is ", JSON.stringify(bodyParam));

    // if(bodyParam.object) {
    //     if(bodyParam.entry &&
    //         bodyParam.entry[0].changes &&
    //         bodyParam.entry[0].changes[0].value.messages &&
    //         bodyParam.entry[0].changes[0].value.messages
    //         )  {
    //             let phoneNumberId = bodyParam.entry[0].changes[0].value.metadata.phone_number_id;
    //             let from = bodyParam.entry[0].changes[0].value.messages[0].from;
    //             let msgBody = bodyParam.entry[0].changes[0].value.messages[0].text.body;

    //             console.log('We got msg ', msgBody);

    //             // {
    //             //     "messaging_product": "whatsapp",
    //             //     "to": "918369240497",
    //             //     "type": "template",
    //             //     "template": { "name": "hello_world",
    //             //     "language": { "code": "en_US" } }
    //             // }

    //             axios({
    //                 method: 'post',
    //                 url: `https://graph.facebook.com/v14.0/${phoneNumberId}/messages?access_token=${token}`,
    //                 data: {
    //                     messaging_product: "whatsapp",
    //                     to: from,
    //                     text: {
    //                         body: `Hii your msg is ${msgBody}`
    //                     }
    //                 },
    //                 headers: {
    //                     "Content-Type": "application/json"
    //                 }
    //             });

    //             res.sendStatus(200);
    //     } else {
    //         res.sendStatus(404);
    //     }
    // }
});



