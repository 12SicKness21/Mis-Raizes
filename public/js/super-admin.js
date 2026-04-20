// super-admin.js
const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const addReviewForm = document.getElementById('addReviewForm');
const statusBar = document.getElementById('statusBar');
const statusMessage = document.getElementById('statusMessage');

const REVIEWS_COLLECTION = 'resenas';

// Firebase Auth Listener
auth.onAuthStateChanged((user) => {
    if (user) {
        if (user.email === 'sickness@misrazies.es' || user.email === 'sickness@misraizes.es') {
            loginScreen.style.display = 'none';
            adminPanel.style.display = 'block';
        } else {
            auth.signOut();
            showError('Usuario no autorizado para este panel.');
        }
    } else {
        loginScreen.style.display = 'flex';
        adminPanel.style.display = 'none';
    }
});

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    const btn = loginForm.querySelector('button');

    try {
        btn.disabled = true;
        btn.textContent = 'Iniciando...';
        loginError.style.display = 'none';
        
        await auth.signInWithEmailAndPassword(email, password);
        
    } catch (error) {
        showError('Credenciales incorrectas o error de acceso.');
        console.error(error);
        btn.disabled = false;
        btn.textContent = 'Acceder';
    }
});

function logout() {
    auth.signOut();
}

function showError(msg) {
    loginError.textContent = msg;
    loginError.style.display = 'block';
}

function showStatus(msg, isError = false) {
    statusMessage.textContent = msg;
    statusBar.style.display = 'flex';
    statusBar.style.backgroundColor = isError ? '#e74c3c' : '#2ecc71';
    
    setTimeout(() => {
        hideStatus();
    }, 4000);
}

function hideStatus() {
    statusBar.style.display = 'none';
}

// Add Review
addReviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('reviewName').value.trim().slice(0, 100);
    const rating = parseInt(document.getElementById('reviewRating').value, 10);
    const comment = document.getElementById('reviewComment').value.trim().slice(0, 1000);

    if (!name) { showError('El nombre no puede estar vacío.'); return; }
    if (isNaN(rating) || rating < 1 || rating > 5) { showError('La puntuación debe estar entre 1 y 5.'); return; }

    const btn = addReviewForm.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
        await db.collection(REVIEWS_COLLECTION).add({
            name: name,
            rating: rating,
            comment: comment,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showStatus('Reseña guardada correctamente.');
        addReviewForm.reset();
    } catch (error) {
        console.error('Error guardando reseña:', error);
        showStatus('Error al guardar la reseña.', true);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar Reseña';
    }
});
