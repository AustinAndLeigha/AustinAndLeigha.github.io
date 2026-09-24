import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBF50gjuKwNYo1tYmZjdSmun7p1vLeSu-s",
    authDomain: "austinandleigha.firebaseapp.com",
    projectId: "austinandleigha",
    storageBucket: "austinandleigha.firebasestorage.app",
    messagingSenderId: "848942131509",
    appId: "1:848942131509:web:00a3e7e00472db7675847c"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Firestore
const db = getFirestore(app);


console.log("Firebase connected successfully!");

export { db };