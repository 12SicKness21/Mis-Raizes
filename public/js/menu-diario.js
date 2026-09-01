// ============================================
// Mis Raízes - Menú Mensual / Diario (Septiembre)
// ============================================

// Menú precargado del mes de Septiembre
const MENU_SEPTIEMBRE = {
    mes: "Septiembre",
    precio: "13,90€",
    incluye: "Primero + Segundo + Bebida + Postre",
    dias: {
        1: {
            id: 'lunes',
            nombre: 'Lunes',
            activo: true,
            entradas: ['Ceviche', 'Aguadito', 'Causa Limeña'],
            segundos: [
                'Arroz con pollo',
                'Lentejas c/ (dorada o filete)',
                'Cerdo con ensalada rusa',
                '¼ pollo a la brasa'
            ]
        },
        2: {
            id: 'martes',
            nombre: 'Martes',
            activo: true,
            entradas: ['Sopa wantan', 'Wantan frito', 'Tequeños', 'Papa rellena'],
            segundos: [
                'Combinado de pollo',
                'Chijaukay',
                'Aeropuerto',
                '¼ pollo a la brasa'
            ]
        },
        3: {
            id: 'miercoles',
            nombre: 'Miércoles',
            activo: false,
            cerrado: true,
            mensaje: 'Cerrado por descanso del personal',
            entradas: [],
            segundos: []
        },
        4: {
            id: 'jueves',
            nombre: 'Jueves',
            activo: true,
            entradas: ['Leche de tigre', 'Anticucho', 'Caldo de gallina'],
            segundos: [
                'Cau cau',
                'Tallarines rojos con papa a la huancaína',
                '¼ pollo a la brasa'
            ]
        },
        5: {
            id: 'viernes',
            nombre: 'Viernes',
            activo: true,
            entradas: ['Patasca', 'Ceviche', 'Chicharrón de pota'],
            segundos: [
                'Picante de carne',
                'Ají de gallina',
                '¼ pollo a la brasa',
                'Pollada'
            ]
        }
    }
};

// Mapeo inteligente de platos a imágenes disponibles
const DISH_IMAGE_MAP = {
    'ceviche': 'ceviche',
    'aguadito': 'aguadito',
    'causa limena': 'causa_limena',
    'causa limeña': 'causa_limena',
    'arroz con pollo': 'arroz_con_pollo',
    'lentejas c/ (dorada o filete)': 'dorada_frita',
    'lentejas con dorada': 'dorada_frita',
    'cerdo con ensalada rusa': 'adobo_de_cerdo__con_ensalada_rusa',
    '¼ pollo a la brasa': 'pollo_a_la_brasa',
    '1/4 pollo a la brasa': 'pollo_a_la_brasa',
    'pollo a la brasa': 'pollo_a_la_brasa',
    'sopa wantan': 'sopa_wantan',
    'wantan frito': 'wantan_frito',
    'tequenos': 'tequenos',
    'tequeños': 'tequenos',
    'papa rellena': 'papa_rellena',
    'combinado de pollo': 'chaufa_de_pollo',
    'chijaukay': 'chijaukay',
    'aeropuerto': 'aeropuerto',
    'leche de tigre': 'leche_de_tigre',
    'anticucho': 'anticucho',
    'caldo de gallina': 'caldo_de_gallina',
    'cau cau': 'chanfainita',
    'caucau': 'chanfainita',
    'tallarines rojos con papa a la huancaina': 'tallarines_rojos',
    'tallarines rojos con papa a la huancaína': 'tallarines_rojos',
    'patasca': 'patasca',
    'chicharron pota': 'chicharron_de_pota',
    'chicharron de pota': 'chicharron_de_pota',
    'chicharrón pota': 'chicharron_de_pota',
    'chicharrón de pota': 'chicharron_de_pota',
    'picante de carne': 'picante_de_ternera',
    'aji de gallina': 'aji_de_gallina',
    'ají de gallina': 'aji_de_gallina',
    'pollada': 'pollada'
};

function getDishImage(dishName) {
    const raw = (dishName || '').toLowerCase().trim();
    const norm = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const mapped = DISH_IMAGE_MAP[raw] || DISH_IMAGE_MAP[norm];
    if (mapped) {
        return {
            webp: `img/menu/${mapped}.webp`,
            avif: `img/menu/${mapped}.avif`
        };
    }
    const clean = norm.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    return {
        webp: `img/menu/${clean}.webp`,
        avif: `img/menu/${clean}.avif`
    };
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
    if (!str) return '';
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Estado actual de la vista
let currentSelectedDay = 1;
let currentViewMode = 'day'; // 'day' o 'week'
let activeMenuData = MENU_SEPTIEMBRE;

async function loadDailyMenu() {
    const container = document.getElementById('menu-container');
    if (!container) return;

    // Determinar día de hoy (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
    const todayIndex = new Date().getDay();

    // Seleccionar por defecto el día de hoy si está entre Lunes y Viernes,
    // o Lunes si es fin de semana.
    if (todayIndex >= 1 && todayIndex <= 5) {
        currentSelectedDay = todayIndex;
    } else {
        currentSelectedDay = 1;
    }

    // Intentar leer configuración personalizada de Firestore si existiera
    try {
        if (typeof db !== 'undefined') {
            const doc = await db.collection('config').doc('monthly_menu').get();
            if (doc.exists && doc.data() && doc.data().dias) {
                activeMenuData = doc.data();
            }
        }
    } catch (err) {
        console.warn('Usando menú precargado de Septiembre:', err);
    }

    // Inyectar CSS auxiliar si no existe
    if (!document.getElementById('scrollbar-style')) {
        const style = document.createElement('style');
        style.id = 'scrollbar-style';
        style.innerHTML = `
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            @keyframes pulseGlow {
                0%, 100% { box-shadow: 0 0 15px rgba(249, 212, 6, 0.4); }
                50% { box-shadow: 0 0 25px rgba(249, 212, 6, 0.7); }
            }
            .glow-active { animation: pulseGlow 2.5s infinite ease-in-out; }
        `;
        document.head.appendChild(style);
    }

    renderMenu();
}

function renderMenu() {
    const container = document.getElementById('menu-container');
    if (!container) return;

    const todayIndex = new Date().getDay();
    const isWeekend = (todayIndex === 0 || todayIndex === 6);

    let html = '';

    // Aviso de fin de semana si aplica
    if (isWeekend) {
        html += `
            <div class="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center mb-4 flex items-center justify-center gap-3">
                <span class="material-symbols-outlined text-primary text-xl">info</span>
                <p class="text-slate-300 text-xs sm:text-sm">
                    El menú del día está disponible de <strong>Lunes a Viernes</strong>. ¡Puedes explorar los platos de cada día a continuación!
                </p>
            </div>
        `;
    }

    // Barra de Selector de Días + Modo Semana
    html += `
        <div class="flex flex-col gap-3 mb-8">
            <div class="flex items-center justify-between gap-2">
                <span class="text-xs uppercase tracking-widest text-slate-400 font-semibold">Selecciona un día:</span>
                <button 
                    onclick="toggleViewMode()" 
                    class="text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1 py-1 px-2.5 rounded-lg bg-primary/10 border border-primary/20 transition-all"
                >
                    <span class="material-symbols-outlined text-base">${currentViewMode === 'day' ? 'view_agenda' : 'calendar_today'}</span>
                    <span>${currentViewMode === 'day' ? 'Ver Semana Completa' : 'Ver por Día'}</span>
                </button>
            </div>

            <!-- Botones de Días -->
            <div class="grid grid-cols-5 gap-1.5 sm:gap-3 bg-black/40 p-1.5 sm:p-2 rounded-2xl border border-primary/20">
    `;

    const dayKeys = [1, 2, 3, 4, 5];
    dayKeys.forEach(dKey => {
        const dayInfo = activeMenuData.dias[dKey];
        if (!dayInfo) return;

        const isToday = (todayIndex === dKey);
        const isSelected = (currentViewMode === 'day' && currentSelectedDay === dKey);
        const isClosed = dayInfo.cerrado;

        let btnClass = "relative flex flex-col items-center justify-center py-2.5 sm:py-3 px-1 rounded-xl font-bold uppercase tracking-wider text-[11px] sm:text-xs transition-all duration-200 select-none cursor-pointer ";

        if (isSelected) {
            btnClass += "bg-primary text-background-dark shadow-lg shadow-primary/30 font-black scale-[1.02] ";
        } else if (isClosed) {
            btnClass += "bg-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10 ";
        } else {
            btnClass += "bg-white/5 text-slate-200 hover:bg-white/15 hover:text-primary ";
        }

        html += `
            <button onclick="selectDay(${dKey})" class="${btnClass}">
                ${isToday ? `<span class="absolute -top-1.5 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full tracking-widest uppercase shadow">HOY</span>` : ''}
                <span class="whitespace-nowrap sm:hidden">${escapeHtml(dayInfo.nombre.slice(0, 3))}</span>
                <span class="whitespace-nowrap hidden sm:inline">${escapeHtml(dayInfo.nombre)}</span>
            </button>
        `;
    });

    html += `
            </div>
        </div>
    `;

    // Renderizar según el modo (Día o Semana Completa)
    if (currentViewMode === 'day') {
        html += renderSingleDay(currentSelectedDay, todayIndex);
    } else {
        html += renderFullWeek(todayIndex);
    }

    container.innerHTML = html;
}

// Renderiza un único día con tarjetas horizontales de fotos
function renderSingleDay(dayKey, todayIndex) {
    const dayInfo = activeMenuData.dias[dayKey];
    if (!dayInfo) return '';

    const isToday = (todayIndex === dayKey);

    if (dayInfo.cerrado) {
        return `
            <div class="text-center py-12 bg-white/5 gold-border rounded-3xl p-8 my-4">
                <span class="material-symbols-outlined text-primary text-5xl mb-4">coffee</span>
                <h3 class="text-primary text-2xl font-black uppercase tracking-widest italic mb-2">${escapeHtml(dayInfo.nombre)}</h3>
                <p class="text-slate-300 text-base max-w-md mx-auto mb-6">${escapeHtml(dayInfo.mensaje || 'Cerrado por descanso del personal')}</p>
                <div class="flex flex-wrap justify-center gap-3">
                    <button onclick="selectDay(4)" class="px-5 py-2.5 rounded-full bg-primary/20 border border-primary/40 text-primary font-bold text-xs uppercase tracking-wider hover:bg-primary hover:text-background-dark transition-all">
                        Ver Menú del Jueves →
                    </button>
                </div>
            </div>
        `;
    }

    let out = `
        <div class="mb-6">
            <div class="flex items-center justify-between mb-4 border-b border-primary/20 pb-3">
                <div class="flex items-center gap-3">
                    <h2 class="text-2xl sm:text-3xl font-black uppercase tracking-wider text-primary italic font-serif">
                        ${escapeHtml(dayInfo.nombre)}
                    </h2>
                    ${isToday ? `<span class="bg-primary text-background-dark text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">HOY</span>` : ''}
                </div>
                <span class="text-slate-400 text-xs tracking-widest uppercase">Mes de ${escapeHtml(activeMenuData.mes || 'Septiembre')}</span>
            </div>
    `;

    // Entradas / Primeros
    if (dayInfo.entradas && dayInfo.entradas.length > 0) {
        out += `
            <div class="mb-8">
                <div class="flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-primary text-xl">soup_kitchen</span>
                    <h3 class="text-white font-black uppercase tracking-widest text-sm sm:text-base font-serif">Primeros (Entradas)</h3>
                    <div class="h-[1px] flex-1 bg-gradient-to-r from-primary/30 to-transparent ml-2"></div>
                </div>
                <div class="flex overflow-x-auto sm:overflow-x-visible sm:flex-wrap sm:justify-start gap-4 pb-4 snap-x snap-mandatory hide-scrollbar">
                    ${dayInfo.entradas.map(generateDishHTML).join('')}
                </div>
            </div>
        `;
    }

    // Segundos
    if (dayInfo.segundos && dayInfo.segundos.length > 0) {
        out += `
            <div class="mb-6">
                <div class="flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-primary text-xl">restaurant</span>
                    <h3 class="text-white font-black uppercase tracking-widest text-sm sm:text-base font-serif">Segundos</h3>
                    <div class="h-[1px] flex-1 bg-gradient-to-r from-primary/30 to-transparent ml-2"></div>
                </div>
                <div class="flex overflow-x-auto sm:overflow-x-visible sm:flex-wrap sm:justify-start gap-4 pb-4 snap-x snap-mandatory hide-scrollbar">
                    ${dayInfo.segundos.map(generateDishHTML).join('')}
                </div>
            </div>
        `;
    }

    out += `
            <p class="text-center text-white/40 text-[11px] italic mt-4 font-display">* Imágenes referenciales de nuestros platos</p>
        </div>
    `;

    return out;
}

// Renderiza la semana completa en tarjetas
function renderFullWeek(todayIndex) {
    let out = `<div class="space-y-6">`;

    const dayKeys = [1, 2, 3, 4, 5];
    dayKeys.forEach(dKey => {
        const dayInfo = activeMenuData.dias[dKey];
        if (!dayInfo) return;

        const isToday = (todayIndex === dKey);

        if (dayInfo.cerrado) {
            out += `
                <div class="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between opacity-60">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-slate-500">coffee</span>
                        <span class="font-bold text-slate-400 uppercase tracking-widest text-sm">${escapeHtml(dayInfo.nombre)}</span>
                    </div>
                    <span class="text-xs text-slate-500 italic">Descanso del personal</span>
                </div>
            `;
            return;
        }

        out += `
            <div class="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/5 border ${isToday ? 'border-primary glow-active' : 'border-primary/20'} transition-all">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <h3 class="text-xl sm:text-2xl font-black text-primary uppercase italic font-serif">${escapeHtml(dayInfo.nombre)}</h3>
                        ${isToday ? `<span class="bg-primary text-background-dark text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">HOY</span>` : ''}
                    </div>
                    <button onclick="selectDay(${dKey})" class="text-xs font-bold text-primary/80 hover:text-primary hover:underline uppercase tracking-wider flex items-center gap-1">
                        <span>Ver con fotos</span> →
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-black/30 p-3.5 rounded-xl border border-white/5">
                        <p class="text-primary font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-sm">soup_kitchen</span> Entradas:
                        </p>
                        <ul class="text-slate-200 text-xs sm:text-sm space-y-1 pl-1">
                            ${dayInfo.entradas.map(e => `<li>• ${escapeHtml(e)}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="bg-black/30 p-3.5 rounded-xl border border-white/5">
                        <p class="text-primary font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-sm">restaurant</span> Segundos:
                        </p>
                        <ul class="text-slate-200 text-xs sm:text-sm space-y-1 pl-1">
                            ${dayInfo.segundos.map(s => `<li>• ${escapeHtml(s)}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    });

    out += `</div>`;
    return out;
}

// Genera el HTML de la tarjeta de un plato
function generateDishHTML(plato) {
    const imgInfo = getDishImage(plato);

    return `
        <div class="group relative flex-none w-[185px] h-[220px] sm:w-[220px] sm:h-[260px] rounded-2xl sm:rounded-3xl overflow-hidden snap-start shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 hover:border-primary/60 transition-all duration-300 cursor-pointer bg-[#14120c]">
            <img
                src="${escapeAttr(imgInfo.avif)}"
                alt="${escapeAttr(plato)}"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onerror="this.style.display='none'"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"></div>
            <div class="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
                <h4 class="text-white text-sm sm:text-base font-bold leading-tight font-serif drop-shadow-lg group-hover:text-primary transition-colors">
                    ${escapeHtml(plato)}
                </h4>
            </div>
        </div>
    `;
}

// Controladores de interacción
window.selectDay = function (dayKey) {
    currentSelectedDay = dayKey;
    currentViewMode = 'day';
    renderMenu();
};

window.toggleViewMode = function () {
    currentViewMode = (currentViewMode === 'day') ? 'week' : 'day';
    renderMenu();
};

function handleDishImageError(img) {
    const fallback = img.dataset.fallback;
    if (fallback && img.src.indexOf(fallback) === -1) {
        img.src = fallback;
    } else {
        img.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', loadDailyMenu);
