const admin = require('firebase-admin');

// 1. Download your service account key from Firebase Console:
// Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require('./service-account-file.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// 2. Paste the FCM Token from your PulseCare Mobile Settings screen here:
const registrationToken = 'PASTE_YOUR_TOKEN_HERE';

const message = {
    notification: {
        title: 'PulseCare Instant Alert! 🌸',
        body: 'This is a real-time notification sent from a server, just like YouTube!'
    },
    android: {
        priority: 'high',
        notification: {
            channelId: 'default',
            priority: 'max',
        }
    },
    token: registrationToken
};

// Send a message to the device corresponding to the provided registration token.
admin.messaging().send(message)
    .then((response) => {
        console.log('Successfully sent message:', response);
    })
    .catch((error) => {
        console.log('Error sending message:', error);
    });
