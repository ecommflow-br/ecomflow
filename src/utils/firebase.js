import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDsmuW218Fz2Nd_T441JxTHoNFa4P8rOMY",
    authDomain: "ecomflow-2f524.firebaseapp.com",
    projectId: "ecomflow-2f524",
    storageBucket: "ecomflow-2f524.firebasestorage.app",
    messagingSenderId: "586147263591",
    appId: "1:586147263591:web:0756e22a2f28b49445d0c2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
