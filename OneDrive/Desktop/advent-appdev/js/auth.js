// js/auth.js
import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

export function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Login successful
            const user = userCredential.user;
            console.log("Login success:", user.email);
            return { success: true, user };
        })
        .catch((error) => {
            console.error("Login failed:", error.message);
            return { success: false, message: error.message };
        });
}
