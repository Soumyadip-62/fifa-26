/* eslint-disable turbo/no-undeclared-env-vars */
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB_kZoRVRZlpIOV7KYBY-_U16HMD-Bh_e4",
  authDomain: "fifa-notification-service.firebaseapp.com",
  projectId: "fifa-notification-service",
  storageBucket: "fifa-notification-service.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGID || "774951739922",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:774951739922:web:3927a19897a9e9135baecb",
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID || "G-F44Z3V82BS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export async function getFirebaseMessaging() {
  if (typeof window === "undefined") {
    return null;
  }

  const supported = await isSupported();

  if (!supported) {
    return null;
  }

  return getMessaging(app);
}
