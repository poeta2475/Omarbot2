import {
    db, collection, getDocs, query, where, auth, onAuthStateChanged, doc, getDoc
} from './firebase_config.js';
import { showNotification } from './auth.js';

const usuariosTableBody = document.getElementById('usuariosTableBody');

function escapeHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
}

// Verificar si el usuario es administrador
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const userDocRef = doc(db, 'usuarios', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.rol !== 'admin' && userData.rol !== 'administrador') {
                showNotification('No tienes permisos para acceder a esta página', 'error');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                return;
            }
            // Si es admin, cargar los usuarios
            cargarUsuarios();
        } else {
            window.location.href = 'index.html';
        }
    } catch {
        window.location.href = 'index.html';
    }
});

async function cargarUsuarios() {
    try {
        // Consulta para traer solo usuarios con rol 'cliente'
        const q = query(collection(db, 'usuarios'), where('rol', '==', 'cliente'));
        const querySnapshot = await getDocs(q);
        
        usuariosTableBody.innerHTML = '';

        if (querySnapshot.empty) {
            usuariosTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                        No se encontraron clientes registrados.
                    </td>
                </tr>
            `;
            return;
        }

        querySnapshot.forEach((doc) => {
            const user = doc.data();
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-100 hover:bg-gray-50 transition-colors';
            
            // Formatear la fecha
            let fecha = 'N/A';
            if (user.createdAt) {
                fecha = new Date(user.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }

            row.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900">${escapeHtml(user.nombre || 'Sin nombre')}</td>
                <td class="px-6 py-4 text-gray-600">${escapeHtml(user.correo)}</td>
                <td class="px-6 py-4 text-gray-600">${escapeHtml(user.telefono || 'Sin teléfono')}</td>
                <td class="px-6 py-4 text-gray-600">${escapeHtml(fecha)}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">
                        ${escapeHtml(user.rol)}
                    </span>
                </td>
            `;
            usuariosTableBody.appendChild(row);
        });
    } catch {
        showNotification('Error al cargar el listado de usuarios', 'error');
        usuariosTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-12 text-center text-red-500">
                    Ocurrió un error al cargar los datos.
                </td>
            </tr>
        `;
    }
}
