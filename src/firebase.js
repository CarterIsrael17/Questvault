import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmhxr85PQ1wUUka7icgD4hxlRCo1q93T8",
  authDomain: "questvault-986b1.firebaseapp.com",
  projectId: "questvault-986b1",
  storageBucket: "questvault-986b1.appspot.com",
  messagingSenderId: "737065810316",
  appId: "1:737065810316:web:fb35c10c79ecafb13a3ea9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
