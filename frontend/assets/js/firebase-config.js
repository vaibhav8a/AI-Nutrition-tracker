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

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Firebase Authentication reference
const auth = firebase.auth();
console.log('✅ Auth object created:', typeof auth);
