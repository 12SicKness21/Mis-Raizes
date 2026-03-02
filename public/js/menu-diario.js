// ============================================
// Mis Raízes - Daily Menu Logic (Firebase)
// ============================================

async function loadDailyMenu() {
    const container = document.getElementById('menu-container');

    try {
        const doc = await db.collection('config').doc('weekly_menu').get();

        if (!doc.exists) {
            container.innerHTML = '<p class="text-center text-slate-400 py-10">El menú se está preparando...</p>';
            return;
        }

        const data = doc.data();
        const primeros = data.primeros || [];
        const segundos = data.segundos || [];

        // Helper function to format dish names as filenames
        const formatDishName = (name) => {
            return name
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                .toLowerCase() // Convert to lowercase
                .trim()
                .replace(/\s+/g, '_'); // Replace spaces with underscores
        };

        const generateDishHTML = (plato) => {
            const fileName = formatDishName(plato);
            return `
                <div class="group relative overflow-hidden rounded-2xl bg-white/5 gold-border transition-all h-32 flex items-center justify-center">
                    <img 
                        src="img/menu/${fileName}.webp" 
                        alt="${plato}" 
                        class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onerror="if(this.src.endsWith('.webp')) this.src='img/menu/${fileName}.avif'; else this.style.display='none';"
                    >
                    <div class="absolute inset-0 bg-background-dark/60 group-hover:bg-background-dark/40 transition-colors"></div>
                    <p class="relative z-10 text-slate-100 font-bold uppercase tracking-widest text-center px-4 drop-shadow-md">
                        ${plato}
                    </p>
                </div>
            `;
        };

        let html = '';

        // Section: Primeros
        if (primeros.length > 0) {
            html += `
                <div class="animate-slideInUp">
                    <div class="flex items-center gap-4 mb-6">
                        <div class="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30"></div>
                        <h2 class="text-primary font-black uppercase tracking-[0.3em] italic text-xl">Primeros</h2>
                        <div class="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30"></div>
                    </div>
                    <div class="grid grid-cols-1 gap-4">
                        ${primeros.map(generateDishHTML).join('')}
                    </div>
                </div>
            `;
        }

        // Section: Segundos
        if (segundos.length > 0) {
            html += `
                <div class="animate-slideInUp" style="animation-delay: 0.2s">
                    <div class="flex items-center gap-4 mb-6">
                        <div class="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30"></div>
                        <h2 class="text-primary font-black uppercase tracking-[0.3em] italic text-xl">Segundos</h2>
                        <div class="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30"></div>
                    </div>
                    <div class="grid grid-cols-1 gap-4">
                        ${segundos.map(generateDishHTML).join('')}
                    </div>
                </div>
            `;
        }

        if (!html) {
            container.innerHTML = '<p class="text-center text-slate-400 py-10">Consúltanos por el menú del día.</p>';
        } else {
            container.innerHTML = html;
        }

    } catch (err) {
        console.error('Error loading daily menu:', err);
        container.innerHTML = '<p class="text-center text-red-400 py-10">Error al cargar el menú. Por favor, reintenta más tarde.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadDailyMenu);
