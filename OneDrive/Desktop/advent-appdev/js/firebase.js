// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBnJ5CSUb4AQM7hmhJ4eQ_nTac4MAQeLOM",
    authDomain: "advent-b3755.firebaseapp.com",
    projectId: "advent-b3755",
    storageBucket: "advent-b3755.firebasestorage.app",
    messagingSenderId: "504527654278",
    appId: "1:504527654278:web:b6f567141aa23304ca3007"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword };
