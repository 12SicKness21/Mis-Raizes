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

        // Fetch descriptions from main menu to match the design mock-up
        let menuDescMap = {};
        try {
            const menuSnap = await db.collection('menu').get();
            menuSnap.forEach(mDoc => {
                const mData = mDoc.data();
                if (mData.items) {
                    mData.items.forEach(item => {
                        if (item.nombre && item.descripcion) {
                            menuDescMap[item.nombre.trim().toLowerCase()] = item.descripcion;
                        }
                    });
                }
            });
        } catch (e) {
            console.warn("Could not fetch descriptions for daily menu", e);
        }

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
            const desc = menuDescMap[plato.trim().toLowerCase()] || '';

            return `
                <div class="group flex items-center gap-4 sm:gap-6 rounded-full border border-[#3d3a2b] bg-[#29271c] p-2 pr-6 hover:border-primary/40 transition-all shadow-md mb-4 w-full cursor-default">
                    <div class="rounded-full size-20 sm:size-24 shrink-0 overflow-hidden relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] ml-1 border border-[#1a1811]">
                        <img 
                            src="img/menu/${fileName}.webp" 
                            alt="${plato}" 
                            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onerror="if(this.src.endsWith('.webp')) this.src='img/menu/${fileName}.avif'; else this.style.display='none';"
                        >
                    </div>
                    <div class="flex flex-col justify-center py-2 flex-1">
                        <h3 class="text-white text-[1.3rem] sm:text-2xl font-black tracking-wide leading-tight group-hover:text-primary transition-colors font-serif" style="text-shadow: 0 1px 3px rgba(0,0,0,0.9);">
                            ${plato}
                        </h3>
                        ${desc ? `<p class="text-[#8fa3b0] text-xs sm:text-[0.95rem] leading-snug mt-1 font-serif group-hover:text-[#a5b9c7] transition-colors">${desc}</p>` : ''}
                    </div>
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
