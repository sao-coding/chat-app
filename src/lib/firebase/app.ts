// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAfYSTYinrWUArkH_J25Ao7oWf8QUyOqP0",
    authDomain: "chat-app-75026.firebaseapp.com",
    projectId: "chat-app-75026",
    storageBucket: "chat-app-75026.appspot.com",
    messagingSenderId: "951566898258",
    appId: "1:951566898258:web:80265efbc5c37ec5267b8b",
    measurementId: "G-2ZEPRK87R7",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
// const analytics = getAnalytics(app)
export const auth = getAuth(app)
export const db = getFirestore(app)
