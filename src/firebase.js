// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBSLMpirOrkvYVnJOKhdA4M2m-aTqRvbCU",
  authDomain: "harshil-todo.firebaseapp.com",
  projectId: "harshil-todo",
  storageBucket: "harshil-todo.appspot.com",
  messagingSenderId: "897514109344",
  appId: "1:897514109344:web:da419bd5c21afcd3bd8cc5",
  measurementId: "G-BJZ9DGSSF0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);  // Added Firebase Storage

export { auth, provider, db, storage };
