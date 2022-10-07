const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const webPush = require('web-push');
const _ = require('lodash');

require('dotenv').config()

// VAPID keys should only be generated once.
// use `web-push generate-vapid-keys --json` to generate in terminal
// then export them in your shell with the follow env key names
let vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
  };

  // Tell web push about our application server
webPush.setVapidDetails('mailto:siddharth@werqlabs.com', vapidKeys.publicKey, vapidKeys.privateKey);

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const token = process.env.TOKEN;
const myToken = process.env.MY_TOKEN;

// Store subscribers in memory
let subscriptions = [];

app.listen(process.env.PORT || 5000, () => {
    console.log('Node server is start on 8000 port test');
    // send().catch(err => console.error(err));
});

app.get("/", (req, res) => {
    console.log('Default get request called');
    // res.status(200).send("This is sample of Whatsapp webhook's");
    res.send('test api');
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

// Allow host to trigger push notifications from the application server
// app.post('/push', (req, res) => {
//     const notificationMessage = {
//         msg: 'Success'
//     };

//     const deviceToken = 'all';

//     let jsonSub = JSON.parse(deviceToken);

  
//     // Use the web-push library to send the notification message to subscribers
//     webPush
//     .sendNotification(jsonSub, notificationMessage)
//     .then(success => res.send('Send notification successful'))
//     .catch(error => {
//         console.log('error while sending push notification', error);
//         res.send('Error while sending notification')});

// });

// app.post('/push', (req, res, next) => {
//     const pushSubscription = req.body.pushSubscription;
//     const notificationMessage = req.body.notificationMessage;
  
//     if (!pushSubscription) {
//       res.status(400).send('Does not have pushSubscription');
//       return next(false);
//     }
  
//     if (subscriptions.length) {
//       subscriptions.map((subscription, index) => {
//         let jsonSub = JSON.parse(subscription);
  
//         // Use the web-push library to send the notification message to subscribers
//         webPush
//           .sendNotification(jsonSub, notificationMessage)
//           .then(success => handleSuccess(success, index))
//           .catch(error => handleError(error, index));
//       });
//     } else {
//       res.send('constants.messages.NO_SUBSCRIBERS_MESSAGE');
//       return next(false);
//     }
  
//     function handleSuccess(success, index) {
//       res.send('constants.messages.SINGLE_PUBLISH_SUCCESS_MESSAGE');
//       return next(false);
//     }
  
//     function handleError(error, index) {
//       res.status(500).send('constants.errors.ERROR_MULTIPLE_PUBLISH');
//       return next(false);
//     }
//   });


// Allow host to trigger push notifications from the application server
app.post('/push', (req, res, next) => {
  const pushSubscription = req.body.pushSubscription;
  const notificationMessage = req.body.notificationMessage;

  if (!pushSubscription) {
    res.status(400).send('constants.errors.ERROR_SUBSCRIPTION_REQUIRED');
    return next(false);
  }

  if (subscriptions.length) {
    subscriptions.map((subscription, index) => {
      let jsonSub = JSON.parse(subscription);

      console.log('jsonSub : ', jsonSub);

      // Use the web-push library to send the notification message to subscribers
      webPush
        .sendNotification(jsonSub, notificationMessage)
        .then(success => {
          console.log('success : ', success);
          handleSuccess(success, index)})
        .catch(error => handleError(error, index));
    });
  } else {
    res.send('constants.messages.NO_SUBSCRIBERS_MESSAGE');
    return next(false);
  }

  function handleSuccess(success, index) {
    res.send('constants.messages.SINGLE_PUBLISH_SUCCESS_MESSAGE');
    return next(false);
  }

  function handleError(error, index) {
    res.status(500).send('constants.errors.ERROR_MULTIPLE_PUBLISH');
    return next(false);
  }
});


//   //check if the serveice worker can work in the current browser
// if('serviceWorker' in navigator){
 
// }


// //register the service worker, register our push api, send the notification
// async function send(){
//   //register service worker
//   // const register = await navigator.serviceWorker.register('/worker.js', {
//   //     scope: '/'
//   // });

//   console.log('register : ', register)

//   //register push
//   const subscription = await pushManager.subscribe({
//       userVisibleOnly: true,

//       //public vapid key
//       applicationServerKey: urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY)
//   });

//   console.log('subscription : ', subscription)
 
//   //Send push notification
//   await fetch("/subscribe", {
//       method: "POST",
//       body: JSON.stringify(subscription),
//       headers: {
//           "content-type": "application/json"
//       }
//   });
// }

// function urlBase64ToUint8Array(base64String) {
//   const padding = "=".repeat((4 - base64String.length % 4) % 4);
//   const base64 = (base64String + padding)
//     .replace(/\-/g, "+")
//     .replace(/_/g, "/");

//   const rawData = window.atob(base64);
//   const outputArray = new Uint8Array(rawData.length);

//   for (let i = 0; i < rawData.length; ++i) {
//     outputArray[i] = rawData.charCodeAt(i);
//   }
//   return outputArray;
// } 

// Allow clients to subscribe to this application server for notifications
// app.post('/subscribe', (req, res) => {
//   const body = JSON.stringify(req.body);
//   console.log('body : ', body)
//   let sendMessage;
//   if (_.includes(subscriptions, body)) {
//     sendMessage = 'constants.messages.SUBSCRIPTION_ALREADY_STORED';
//   } else {
//     subscriptions.push(body);

//     sendMessage = 'constants.messages.SUBSCRIPTION_STORED';
//   }
//   res.send(sendMessage);
// });

app.post('/post', (req, res) => {

  const token = req.body.token;
  const notification = req.body.notification;
  //   //Send push notification

  console.log('token : ', token);
  console.log('notification : ', notification);


  axios({
                    method: 'post',
                    url: 'https://fcm.googleapis.com/fcm/send',
                    data: {
                      'to': token,
                      'message': {
                        'token': token,
                      },
                      notification: notification
                      // "notification": {
                      //   "title": "Push Notification",
                      //   "body": "Firebase  push notification"
                      // }
                    },
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization':
                          'key=AAAANYoHpnE:APA91bGt9A534YZuJRzqs0v_baoY090jGcIYbvJ5aQ9-e7fjIPsw0qVYssCVToDnnWEV9UheMxZ_EI7rl2INeVdV4G8Q8kR_qpdfqUFZpqF4bPwUFxFef4D_hELYPe1MQ4C-3m7H3OGQ'
                    }
                }).then(() => {
                  res.send('Sucessfully send notification');
                }).catch(err => {
                  res.send('Error sending notification');
                })


});
  



