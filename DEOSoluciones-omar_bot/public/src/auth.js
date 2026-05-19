import { 
    auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification,
    db, doc, getDoc, setDoc
} from './firebase_config.js';

console.log("🔐 DEOSoluciones Auth Module Loaded");

// --- MANEJO DE ERRORES ---
function getFriendlyErrorMessage(errorCode) {
    const errorMessages = {
        // Errores de credenciales
        'auth/invalid-credential': 'Credenciales incorrectas. Verifica tu correo y contraseña.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/user-not-found': 'No existe una cuenta con este correo.',
        'auth/invalid-email': 'El correo electrónico no es válido.',
        
        // Errores de registro
        'auth/email-already-in-use': 'Ya existe una cuenta con este correo.',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
        'auth/invalid-password': 'La contraseña es inválida.',
        
        // Errores de verificación
        'auth/unverified-email': 'Debes verificar tu correo antes de iniciar sesión.',
        
        // Errores de red
        'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
        'auth/timeout': 'La solicitud tardó demasiado. Intenta de nuevo.',
        
        // Errores generales
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
        'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
        'auth/requires-recent-login': 'Por seguridad, cierra sesión y vuelve a entrar.',
        'auth/popup-closed-by-user': 'Inicio de sesión cancelado.',
        'auth/cancelled-popup-request': 'Solo se permite una ventana de inicio de sesión a la vez.',
        'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este correo usando otro método de inicio de sesión.',
        'auth/invalid-verification-code': 'Código de verificación inválido.',
        'auth/invalid-verification-id': 'ID de verificación inválido.'
    };
    
    return errorMessages[errorCode] || 'Ha ocurrido un error. Intenta de nuevo.';
}

// --- NOTIFICACIONES MEJORADAS ---
export function showNotification(message, type = 'info') {
    // Eliminar notificaciones anteriores para evitar acumulación
    const existingNotifications = document.querySelectorAll('.deo-notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = 'deo-notification fixed top-6 right-6 z-[100] max-w-md transform translate-x-full transition-all duration-500 ease-out';

    const iconConfig = {
        success: { icon: 'check_circle', color: 'from-green-500 to-emerald-600', bgIcon: 'bg-green-100', textIcon: 'text-green-600' },
        error: { icon: 'error', color: 'from-red-500 to-rose-600', bgIcon: 'bg-red-100', textIcon: 'text-red-600' },
        info: { icon: 'info', color: 'from-blue-500 to-cyan-600', bgIcon: 'bg-blue-100', textIcon: 'text-blue-600' },
        warning: { icon: 'warning', color: 'from-amber-500 to-orange-600', bgIcon: 'bg-amber-100', textIcon: 'text-amber-600' }
    };

    const config = iconConfig[type] || iconConfig.info;

    notification.innerHTML = `
        <div class="flex items-start gap-3 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden min-w-[320px]">
            <div class="bg-gradient-to-br ${config.color} p-4 flex items-center justify-center">
                <span class="material-symbols-outlined text-white text-2xl">${config.icon}</span>
            </div>
            <div class="flex-1 py-3 pr-3">
                <p class="text-gray-800 font-medium text-sm leading-relaxed">${message}</p>
            </div>
            <button class="self-start mt-2 mr-2 p-1 hover:bg-gray-100 rounded-full transition-colors" onclick="this.closest('.deo-notification').remove()">
                <span class="material-symbols-outlined text-gray-400 text-lg hover:text-gray-600">close</span>
            </button>
        </div>
        <div class="h-1 bg-gray-100 rounded-b-xl overflow-hidden">
            <div class="h-full bg-gradient-to-r ${config.color} progress-bar" style="width: 100%; animation: progress 4s linear forwards;"></div>
        </div>
    `;

    // Agregar estilos de animación si no existen
    if (!document.getElementById('deo-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'deo-notification-styles';
        style.textContent = `
            @keyframes progress {
                from { width: 100%; }
                to { width: 0%; }
            }
            .deo-notification {
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Animar entrada
    requestAnimationFrame(() => {
        notification.classList.remove('translate-x-full');
        notification.classList.add('translate-x-0');
    });

    // Auto-remover después de 4 segundos
    setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// --- MODAL ---
export function toggleLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.toggle('hidden');
        if (!modal.classList.contains('hidden')) {
            modal.classList.add('flex');
        } else {
            modal.classList.remove('flex');
        }
    }
}

export function showRegisterForm() {
    const title = document.querySelector('#loginModal h2');
    const submitBtn = document.querySelector('#loginModal button[type="submit"]');
    const toggleBtn = document.querySelector('#toggleAuthMode');
    const confirmPasswordField = document.getElementById('confirmPasswordField');
    const confirmPasswordInput = document.getElementById('authConfirmPassword');

    if (title && title.textContent === 'Acceso Central') {
        // Cambiar a modo registro
        title.textContent = 'Crear Cuenta';
        if(submitBtn) submitBtn.textContent = 'Registrarse';
        if(toggleBtn) toggleBtn.textContent = 'Ya tengo cuenta';
        // Mostrar campo de confirmar contraseña
        if(confirmPasswordField) confirmPasswordField.classList.remove('hidden');
        if(confirmPasswordInput) confirmPasswordInput.required = true;
    } else if (title) {
        // Cambiar a modo login
        title.textContent = 'Acceso Central';
        if(submitBtn) submitBtn.textContent = 'Iniciar Sesión';
        if(toggleBtn) toggleBtn.textContent = 'Crear cuenta';
        // Ocultar campo de confirmar contraseña
        if(confirmPasswordField) confirmPasswordField.classList.add('hidden');
        if(confirmPasswordInput) confirmPasswordInput.required = false;
        // Limpiar campo de confirmar contraseña
        if(confirmPasswordInput) confirmPasswordInput.value = '';
    }
}

// --- LOGICA DE AUTH ---
export async function handleGoogleLogin() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        // Crear documento en Firestore si no existe
        await createOrUpdateUserDocument(result.user);
        
        // Verificar rol y redirigir si es admin
        const role = await getUserRole(result.user.uid);
        if (role === 'admin' || role === 'administrador') {
            showNotification('Bienvenido Administrador', 'success');
            window.location.href = 'admin.html';
        } else {
            showNotification('Bienvenido ' + result.user.displayName, 'success');
            toggleLoginModal();
        }
    } catch (error) {
        showNotification(getFriendlyErrorMessage(error.code), 'error');
    }
}

export async function handleEmailLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            showNotification('Por favor, verifica tu correo antes de entrar.', 'error');
            await signOut(auth);
            return;
        }

        // Verificar y actualizar documento en Firestore
        await createOrUpdateUserDocument(user);
        
        // Verificar rol y redirigir si es admin
        const role = await getUserRole(user.uid);
        if (role === 'admin' || role === 'administrador') {
            showNotification('Bienvenido Administrador', 'success');
            window.location.href = 'admin.html';
        } else {
            showNotification('Inicio de sesión exitoso', 'success');
            toggleLoginModal();
        }
    } catch (error) {
        showNotification(getFriendlyErrorMessage(error.code), 'error');
    }
}

export async function handleRegister(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        // Crear documento en Firestore con rol por defecto
        await createOrUpdateUserDocument(userCredential.user);
        showNotification('Registro exitoso. ¡Verifica tu correo!', 'success');
        await signOut(auth);
        toggleLoginModal();
    } catch (error) {
        showNotification(getFriendlyErrorMessage(error.code), 'error');
    }
}

export async function handleAuthFormSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const title = document.querySelector('#loginModal h2');
    const isRegister = title && title.textContent === 'Crear Cuenta';

    if (isRegister) {
        const confirmPassword = document.getElementById('authConfirmPassword').value;
        if (password !== confirmPassword) {
            showNotification('Las contraseñas no coinciden', 'error');
            return;
        }
        await handleRegister(email, password);
    } else {
        await handleEmailLogin(email, password);
    }
}

// --- VERIFICACIÓN DE ROL ---
async function createOrUpdateUserDocument(user) {
    try {
        const userDocRef = doc(db, 'usuarios', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // Crear nuevo documento con rol por defecto 'cliente'
            await setDoc(userDocRef, {
                uid: user.uid,
                correo: user.email,
                nombre: user.displayName || user.email.split('@')[0],
                rol: 'cliente',
                telefono: '',
                createdAt: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Error al crear documento de usuario:', error);
    }
}

async function getUserRole(uid) {
    try {
        console.log('🔍 Buscando rol para UID:', uid);
        const userDocRef = doc(db, 'usuarios', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('📄 Datos del usuario:', userData);
            console.log('🎭 Rol del usuario:', userData.rol);
            return userData.rol || 'cliente';
        } else {
            console.log('❌ Documento no existe en Firestore');
            return 'cliente';
        }
    } catch (error) {
        console.error('❌ Error al obtener rol:', error);
        return 'cliente';
    }
}

export async function handleLogout() {
    try {
        await signOut(auth);
        showNotification('Sesión cerrada', 'success');
        if (window.location.pathname.includes('admin.html')) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        showNotification(getFriendlyErrorMessage(error.code), 'error');
    }
}

export async function handleAdminLogin() {
    const user = auth.currentUser;
    if (!user) {
        showNotification('Debes iniciar sesión primero', 'error');
        return;
    }

    const role = await getUserRole(user.uid);
    if (role === 'admin' || role === 'administrador') {
        showNotification('Acceso admin concedido', 'success');
        window.location.href = 'admin.html';
    } else {
        showNotification('No tienes permisos de administrador', 'error');
    }
}

// --- EXPOSICION GLOBAL ---
window.toggleLoginModal = toggleLoginModal;
window.showRegisterForm = showRegisterForm;
window.handleGoogleLogin = handleGoogleLogin;
window.handleLogout = handleLogout;
window.handleEmailLogin = handleEmailLogin;
window.handleRegister = handleRegister;
window.handleAdminLogin = handleAdminLogin;
window.handleAuthFormSubmit = handleAuthFormSubmit;

// --- ESTADO DE SESIÓN ---
onAuthStateChanged(auth, async (user) => {
    const loginBtns = document.querySelectorAll('.btn-login-trigger');
    const adminLinks = document.querySelectorAll('#adminLink');

    if (user && user.emailVerified) {
        loginBtns.forEach(btn => {
            btn.innerHTML = '<span class="material-symbols-outlined mr-1">logout</span> Salir';
            btn.onclick = (e) => { e.preventDefault(); handleLogout(); };
        });

        // Verificar rol del usuario
        const role = await getUserRole(user.uid);
        if (role === 'admin' || role === 'administrador') {
            adminLinks.forEach(link => link.classList.remove('hidden'));
        } else {
            adminLinks.forEach(link => link.classList.add('hidden'));
        }
    } else {
        loginBtns.forEach(btn => {
            btn.innerHTML = 'Login';
            btn.onclick = (e) => { e.preventDefault(); toggleLoginModal(); };
        });
        adminLinks.forEach(link => link.classList.add('hidden'));
    }
});
