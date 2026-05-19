// ============================================
// CONFIGURACIÓN DE FIREBASE (Versión CDN para Navegador)
// ============================================

// Importar funciones de Firebase desde el CDN oficial
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, orderBy, setDoc, getDoc, where } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDbW_VmseobIhX6lp2W2RtwUj1kg9uFKxs",
  authDomain: "deosoluciones-29141.firebaseapp.com",
  projectId: "deosoluciones-29141",
  storageBucket: "deosoluciones-29141.firebasestorage.app",
  messagingSenderId: "963409340917",
  appId: "1:963409340917:web:8c27e7869c450ac0efd8bc",
  measurementId: "G-1M54KCT4CF"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializar Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Inicializar Firestore
const db = getFirestore(app);

// Exportar funciones para usar en otros archivos
export {
    db, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, orderBy, setDoc, getDoc, where,
    auth, googleProvider, signInWithPopup, signInWithEmailAndPassword,
    createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification
};
