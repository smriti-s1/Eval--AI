import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCg1xgmuIxekER9nQD5n1lDkar0Gjffhuw",
  authDomain: "evalai1-b48f2.firebaseapp.com",
  projectId: "evalai1-b48f2",
  storageBucket: "evalai1-b48f2.appspot.com", // Ye line add ki hai
  messagingSenderId: "1057436034074",         // Ye bhi add karle (Apne console se check kar)
  appId: "1:1057436034074:web:0f5f..."        // Ye bhi zaroori hai
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Ab 'db' sahi se export hoga