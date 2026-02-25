// ============================================
// Mis Raízes - Menu 2 Logic (Weekly Menu)
// ============================================

async function loadWeeklyMenu() {
    try {
        const doc = await db.collection('config').doc('weekly_menu').get();
        if (doc.exists) {
            const data = doc.data();
            const primeros = data.primeros || [];
            const segundos = data.segundos || [];

            const listP = document.getElementById('list-primeros');
            const listS = document.getElementById('list-segundos');

            listP.innerHTML = primeros.map(p => `<li>${p}</li>`).join('');
            listS.innerHTML = segundos.map(s => `<li>${s}</li>`).join('');
        } else {
            console.log("No weekly menu configured");
        }
    } catch (err) {
        console.error('Error loading weekly menu:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadWeeklyMenu);
