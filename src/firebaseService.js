// src/firebaseService.js
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDocs, collection, query, where } from "firebase/firestore";

// Signup user
export async function signup(email, password, matricNumber) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  await setDoc(doc(db, "users", uid), {
    email,
    matricNumber
  });

  return userCredential.user;
}

// Login by matric number
export async function loginByMatric(matricNumber, password) {
  const q = query(collection(db, "users"), where("matricNumber", "==", matricNumber));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("Matric number not found");
  }

  const userData = querySnapshot.docs[0].data();
  const email = userData.email;

  return await signInWithEmailAndPassword(auth, email, password);
}

// Password reset
export async function resetPassword(email) {
  return await sendPasswordResetEmail(auth, email);
}
