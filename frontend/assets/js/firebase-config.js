// Firebase Configuration
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCP7-w6F0XuZxrnzuUQjagdr-C_VR7ZWy8",
    authDomain: "health-tracker-9b687.firebaseapp.com",
    projectId: "health-tracker-9b687",
    storageBucket: "health-tracker-9b687.firebasestorage.app",
    messagingSenderId: "161210657611",
    appId: "1:161210657611:web:8414be0655f159287d96ce",
    measurementId: "G-H4MYCCRWG6"
};

// Wait for Firebase to be available
let auth = null;
let firebaseReady = false;

function initFirebase() {
    // Check for Firebase SDK from CDN
    if (typeof firebase === 'undefined') {
        console.log('⏳ Firebase SDK not loaded yet, retrying in 200ms...');
        setTimeout(initFirebase, 200);
        return;
    }

    try {
        console.log('✅ Firebase SDK found!');
        // Check if already initialized
        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase app initialized');
        } else {
            console.log('✅ Firebase app already initialized');
        }

        // Get auth instance
        auth = firebase.auth();
        firebaseReady = true;
        console.log('✅ Firebase auth ready!');
    } catch (error) {
        console.error('❌ Firebase init error:', error.message);
        setTimeout(initFirebase, 200);
    }
}

// Start Firebase initialization immediately
initFirebase();
initFirebase();
