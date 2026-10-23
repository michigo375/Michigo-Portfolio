
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const firebaseConfig = {
  // 請把 Firebase 提供的設定貼在這裡

  apiKey: "AIzaSyAuMv9H557AlXdxuNS7dORotm5_CPgzkYs",
  authDomain: "guestbook-f4d09.firebaseapp.com",
  projectId: "guestbook-f4d09",
  storageBucket: "guestbook-f4d09.firebasestorage.app",
  messagingSenderId: "328229693466",
  appId: "1:328229693466:web:a51198e8f015aac90709a3"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
signInAnonymously(auth);

const db = getFirestore(app);

export { app, db, auth };
