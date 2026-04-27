// ============================================
// Firebase Configuration - Mis Raízes
// ============================================
// NOTA DE SEGURIDAD: Para Firebase en aplicaciones web, el apiKey es público por diseño
// — identifica el proyecto pero NO autoriza acceso por sí solo.
// La seguridad real está en las Firebase Security Rules (Firestore Rules).
// ASEGÚRATE de que las reglas de Firestore estén configuradas correctamente en la consola.
// Ver: https://firebase.google.com/docs/firestore/security/get-started

const firebaseConfig = {
    apiKey: "AIzaSyCVbSPjMjV7wVdIBjzMhC9tZ2G-eRn-f_E",
    authDomain: "carta-mis-raizes.firebaseapp.com",
    projectId: "carta-mis-raizes",
    storageBucket: "carta-mis-raizes.firebasestorage.app",
    messagingSenderId: "686838234637",
    appId: "1:686838234637:web:2425e3fccc79304a02df44",
    measurementId: "G-5V760BD5YX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Exports
const db = firebase.firestore();
const auth = firebase.auth ? firebase.auth() : null;

// Inicializa Analytics solo si el SDK está cargado en esta página
// (no todas las páginas cargan firebase-analytics-compat.js)
if (typeof firebase.analytics === 'function') {
    firebase.analytics();
}

// Shared utility: escapa HTML usando el mecanismo nativo del navegador
function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

// Shared utility: escapa caracteres peligrosos para uso en atributos HTML (dentro de comillas dobles)
function escapeAttr(str) {
    return (str || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#039;');
}
