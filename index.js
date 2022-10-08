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
let deviceToken = null;

app.listen(process.env.PORT || 5000, () => {
  console.log(`Node server is start on ${process.env.PORT || 5000} port`);
  // send().catch(err => console.error(err));
});

app.get("/", (req, res) => {
  console.log('Default get request called');
  // res.status(200).send("This is sample of Whatsapp webhook's");
  res.send('test api');
});

// To verify webhooks
app.get('/webhooks', (req, res) => {
  let mode = req.query["hub.mode"];
  let challenge = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && token === myToken) {
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

  
  const notification = {
    title: "Node push notification",
    body: "Firebase  push notification using node server",
    data: req.body,
    type: "push"
  }

  sendNotification(req, res, notification);

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

// Sending notification
app.post('/post', (req, res) => {

  const notification = req.body.notification;
  sendNotification(req, res, notification);
  // console.log('token : ', token);
  // console.log('notification : ', notification);

  // if(deviceToken == null) {
  //   res.status(400).json({
  //     success: false,
  //     msg: 'Invalid device token'
  //   });
  // } 

  // if(notification != null) {
  //   axios({
  //     method: 'post',
  //     url: 'https://fcm.googleapis.com/fcm/send',
  //     data: {
  //       'to': deviceToken,
  //       'message': {
  //         'token': deviceToken,
  //       },
  //       notification: notification
  //       // "notification": {
  //       //   "title": "Push Notification",
  //       //   "body": "Firebase  push notification"
  //       // }
  //     },
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization':`key=${process.env.PUSH_AUTH_KEY}`
  //     }
  //   }).then(() => {
  //     // res.send('Sucessfully send notification');
  //     res.status(200).json({
  //       success: true,
  //       msg: 'Sucessfully send notification'
  //     });
  //   }).catch(err => {
  //     res.send('Error sending notification');
  //     res.status(400).json({
  //       success: true,
  //       msg: 'Error sending notification'
  //     });
  //   })
  // } else {
  //   res.status(400).json({
  //     success: false,
  //     msg: 'Invalid notification data'
  //   })
  // }
});

function sendNotification(req, res, notification) {
  console.log('token : ', token);
  console.log('notification : ', notification);

  if(deviceToken == null) {
    res.status(400).json({
      success: false,
      msg: 'Invalid device token'
    });
  } 

  if(notification != null) {
    axios({
      method: 'post',
      url: 'https://fcm.googleapis.com/fcm/send',
      data: {
        'to': deviceToken,
        'message': {
          'token': deviceToken,
        },
        notification: notification
        // "notification": {
        //   "title": "Push Notification",
        //   "body": "Firebase  push notification"
        // }
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization':`key=${process.env.PUSH_AUTH_KEY}`
      }
    }).then(() => {
      // res.send('Sucessfully send notification');
      res.status(200).json({
        success: true,
        msg: 'Sucessfully send notification'
      });
    }).catch(err => {
      res.send('Error sending notification');
      res.status(400).json({
        success: true,
        msg: 'Error sending notification'
      });
    })
  } else {
    res.status(400).json({
      success: false,
      msg: 'Invalid notification data'
    })
  }

}

// Register device token
app.post('/registerDevice', (req, res) => {
  const token = req.body.deviceToken;
  if(token != null) {
    deviceToken = token;
    res.status(200).json({
      success: true,
      msg: 'Device register successfully.'
    });
  } else {
    res.status(400).json({
      success: false,
      msg: 'Can not find deviceToken'
    });
  }
})




