importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyDKsn9EP68n-8tx_hsgMs2XJ9vj2BJS33g",
    authDomain: "pcod-and-pocs.firebaseapp.com",
    projectId: "pcod-and-pocs",
    storageBucket: "pcod-and-pocs.firebasestorage.app",
    messagingSenderId: "404417616704",
    appId: "1:404417616704:web:e7facccab9b22a71f5f8a5",
    measurementId: "G-0ER4V894V4"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
