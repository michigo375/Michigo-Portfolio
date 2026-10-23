
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

const firebaseConfig = {
  // 請把 Firebase 提供的設定貼在這裡
};

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuMv9H557AlXdxuNS7dORotm5_CPgzkYs",
  authDomain: "guestbook-f4d09.firebaseapp.com",
  projectId: "guestbook-f4d09",
  storageBucket: "guestbook-f4d09.firebasestorage.app",
  messagingSenderId: "328229693466",
  appId: "1:328229693466:web:a51198e8f015aac90709a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const app = initializeApp(firebaseConfig);

export { app };
