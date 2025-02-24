
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD-ygrOI8024EzhS2Su9DR9slcx25HIcBc",
    authDomain: "tarefas-248ab.firebaseapp.com",
    projectId: "tarefas-248ab",
    storageBucket: "tarefas-248ab.firebasestorage.app",
    messagingSenderId: "372010410113",
    appId: "1:372010410113:web:da142899d8eb4c2041ad80",
    measurementId: "G-Z5HCRB6P4Q"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
// const firebaseAnalytics = getAnalytics(firebaseApp);

const db = getFirestore(firebaseApp)

export { db };