import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGgl2C0oMS9uK3PIwEZ6yR18OQ_e28wDU",
  authDomain: "testleafletmap-2719f.firebaseapp.com",
  databaseURL:
    "https://testleafletmap-2719f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "testleafletmap-2719f",
  storageBucket: "testleafletmap-2719f.appspot.com",
  messagingSenderId: "1095263928138",
  appId: "1:1095263928138:web:eb709bbcb9e4990f164bb3",
  measurementId: "G-G21YVJE609",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
