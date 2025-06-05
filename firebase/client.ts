// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyB9tLyp5YI43zOe4YHuF_sadN_Moz342RM",
  authDomain: "ai-interviewer-451b5.firebaseapp.com",
  projectId: "ai-interviewer-451b5",
  storageBucket: "ai-interviewer-451b5.firebasestorage.app",
  messagingSenderId: "563526947632",
  appId: "1:563526947632:web:deda645e41461f2763eef5",
  measurementId: "G-LQNKYX44V5"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
