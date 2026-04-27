// ============================================
// Mis Raízes - Daily Menu Logic (Firebase)
// ============================================

async function loadDailyMenu() {
    const container = document.getElementById('menu-container');

    // Comprobar si es fin de semana (0 = Domingo, 6 = Sábado)
    const day = new Date().getDay();
    if (day === 0 || day === 6) {
        container.innerHTML = `
            <div class="text-center py-10 bg-white/5 gold-border rounded-2xl p-8 mt-4 animate-slideInUp">
                <span class="material-symbols-outlined text-primary text-5xl mb-4">event_busy</span>
                <h2 class="text-primary text-2xl font-black uppercase tracking-widest italic mb-2">Solo Lunes a Viernes</h2>
                <p class="text-slate-300 text-base mb-8">El menú del día no está disponible durante el fin de semana.</p>
                <a href="carta.html" class="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-background-dark font-black uppercase tracking-widest hover:scale-105 transition-all italic">
                    <span class="material-symbols-outlined">menu_book</span>
                    <span>Ver Nuestra Carta</span>
                </a>
            </div>
        `;
        
        const priceBanner = document.getElementById('price-banner');
        if (priceBanner) {
            priceBanner.style.display = 'none';
        }
        return;
    }

    try {
        const doc = await db.collection('config').doc('weekly_menu').get();

        if (!doc.exists) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center p-12 text-center">
                    <span class="material-symbols-outlined text-primary/40 text-5xl mb-4">restaurant_menu</span>
                    <p class="text-slate-400 uppercase tracking-widest text-sm italic">Sazonando el día...<br>El menú se está preparando.</p>
                </div>
            `;
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
                <div class="group relative flex-none w-[220px] h-[240px] sm:w-[270px] sm:h-[300px] rounded-3xl overflow-hidden snap-start shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/5 cursor-pointer bg-[#14120c]">
                    <img
                        src="img/menu/${escapeAttr(fileName)}.webp"
                        alt="${escapeAttr(plato)}"
                        data-fallback="img/menu/${escapeAttr(fileName)}.avif"
                        class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onerror="handleDishImageError(this)"
                    >
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div class="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                        <h3 class="text-white text-base sm:text-lg font-bold leading-tight font-serif drop-shadow-lg group-hover:text-primary transition-colors">
                            ${escapeHtml(plato)}
                        </h3>
                    </div>
                </div>
            `;
        };

        // Inject custom hide-scrollbar CSS
        if (!document.getElementById('scrollbar-style')) {
            const style = document.createElement('style');
            style.id = 'scrollbar-style';
            style.innerHTML = `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `;
            document.head.appendChild(style);
        }

        let html = '';

        // Seccion: Primeros
        if (primeros.length > 0) {
            html += `
                <div class="animate-slideInUp mb-10 w-full overflow-hidden">
                    <div class="flex items-center gap-3 mb-6 px-1">
                        <span class="material-symbols-outlined text-primary text-2xl">soup_kitchen</span>
                        <h2 class="text-white font-black uppercase tracking-widest font-serif text-lg sm:text-xl shrink-0">Primeros</h2>
                        <div class="h-[1px] w-full max-w-[200px] bg-gradient-to-r from-[#3d3a2b] to-transparent ml-2"></div>
                    </div>
                    <div class="flex overflow-x-auto lg:overflow-x-visible lg:flex-wrap lg:justify-center gap-4 sm:gap-6 pb-6 snap-x snap-mandatory px-1 hide-scrollbar" style="scroll-padding-left: 4px;">
                        ${primeros.map(generateDishHTML).join('')}
                    </div>
                </div>
            `;
        }

        // Seccion: Segundos
        if (segundos.length > 0) {
            html += `
                <div class="animate-slideInUp mb-10 w-full overflow-hidden" style="animation-delay: 0.2s">
                    <div class="flex items-center gap-3 mb-6 px-1">
                        <span class="material-symbols-outlined text-primary text-2xl">restaurant</span>
                        <h2 class="text-white font-black uppercase tracking-widest font-serif text-lg sm:text-xl shrink-0">Segundos</h2>
                        <div class="h-[1px] w-full max-w-[200px] bg-gradient-to-r from-[#3d3a2b] to-transparent ml-2"></div>
                    </div>
                    <div class="flex overflow-x-auto lg:overflow-x-visible lg:flex-wrap lg:justify-center gap-4 sm:gap-6 pb-6 snap-x snap-mandatory px-1 hide-scrollbar" style="scroll-padding-left: 4px;">
                        ${segundos.map(generateDishHTML).join('')}
                    </div>
                </div>
            `;
        }

        if (!html) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center p-12 text-center">
                    <span class="material-symbols-outlined text-primary/40 text-5xl mb-4">info</span>
                    <p class="text-slate-400 uppercase tracking-widest text-sm italic">Consúltanos por el menú del día.</p>
                </div>
            `;
        } else {
            html += `
                <!-- Nota para editar el color/brillo: cambia "text-white/20" por "text-white/40", "text-white/60", o clases como "text-slate-500", "text-slate-400" -->
                <p class="text-center text-white/40 text-[11px] italic mt-2 -mb-2 font-display">* Imágenes referenciales</p>
            `;
            container.innerHTML = html;
        }

    } catch (err) {
        console.error('Error loading daily menu:', err);
        container.innerHTML = '<p class="text-center text-red-400 py-10">Error al cargar el menú. Por favor, reintenta más tarde.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadDailyMenu);

// Gestiona el error de carga de imagen: intenta el fallback .avif, luego oculta
function handleDishImageError(img) {
    const fallback = img.dataset.fallback;
    if (fallback && img.src.indexOf(fallback) === -1) {
        img.src = fallback;
    } else {
        img.style.display = 'none';
    }
}
