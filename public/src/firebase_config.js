// ============================================
// CONFIGURACIÓN DE FIREBASE (Versión CDN para Navegador)
// ============================================

// Importar funciones de Firebase desde el CDN oficial
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, orderBy, setDoc, getDoc, where } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app-check.js";

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

// App Check con reCAPTCHA v3 — protege Firestore de accesos no autorizados.
// Pasos para activar:
//   1. Firebase console → App Check → Apps → Registrar con reCAPTCHA v3
//   2. Google Cloud Console → reCAPTCHA → crear sitio v3 → copiar Site Key
//   3. Reemplazar 'REEMPLAZAR_CON_SITE_KEY_RECAPTCHA_V3' con esa clave
//   4. Firebase console → App Check → Enforce para Firestore y Auth
// NOTA: el CSP en server.js ya incluye los dominios de reCAPTCHA (www.google.com,
// www.gstatic.com). Ver TAREAS_MANUALES.md, tarea #5, para el detalle completo.
const RECAPTCHA_SITE_KEY = 'REEMPLAZAR_CON_SITE_KEY_RECAPTCHA_V3';
if (RECAPTCHA_SITE_KEY !== 'REEMPLAZAR_CON_SITE_KEY_RECAPTCHA_V3') {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
}

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
