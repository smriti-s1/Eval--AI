// js/auth.js
import { auth } from "./firebase.js";
// Real Firebase functions ko import karna zaroori hai
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

/**
 * Real Firebase login function
 */
export async function login(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  if (email.length < 5 || !email.includes("@")) {
    throw new Error("Invalid email format");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  try {
    // Real Firebase SDK syntax: function(auth_instance, email, password)
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    console.log("Login Success:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    // Firebase ke errors ko handle karne ke liye
    console.error("Login Error code:", error.code);
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error("Invalid email or password");
    } else if (error.code === 'auth/too-many-requests') {
        throw new Error("Too many failed attempts. Try again later.");
    } else {
        throw new Error(error.message);
    }
  }
}