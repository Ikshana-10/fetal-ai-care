// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDGh3htJ5IzyBiFWlNZl5Um0W7a95jiSJw",
    authDomain: "fetal-ai-care.firebaseapp.com",
    projectId: "fetal-ai-care",
    storageBucket: "fetal-ai-care.firebasestorage.app",
    messagingSenderId: "381571122943",
    appId: "1:381571122943:web:6d8c8116e82c22ddb22eca",
    measurementId: "G-4MFBZP3LT9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app);